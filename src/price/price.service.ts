import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Price } from './price.entity';
import axios from 'axios';
import * as nodemailer from 'nodemailer';  // For email notifications
import {config} from 'dotenv';
import {AlertService}  from '../alert/alert.service';


config();

@Injectable()
export class PriceService {
  constructor(
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
    private readonly alertService: AlertService,
  ) {}

  // Automatically fetch prices every 5 minutes
  @Cron('*/5 * * * *')
  async fetchPrices() {
    try {
      const ethereumPrice = await this.getPrice('ethereum');
      const polygonPrice = await this.getPrice('polygon');

      const newPrices = [
        { chain_name: 'ethereum', price: ethereumPrice, timestamp: new Date() },
        { chain_name: 'polygon', price: polygonPrice, timestamp: new Date() },
      ];

      await this.priceRepository.save(newPrices);
      console.log('Prices saved successfully:', newPrices);

      // Check for a 3% price increase and send an alert if needed
      await this.checkForPriceIncrease(ethereumPrice, 'ethereum');
      await this.checkForPriceIncrease(polygonPrice, 'polygon');

      // Trigger user-defined alerts if needed
    await this.alertService.checkAlerts(ethereumPrice, 'ethereum');
    await this.alertService.checkAlerts(polygonPrice, 'polygon');

    } catch (error) {
      console.error('Error fetching or saving prices:', error);
    }
  }

  // Check if price increased by more than 3% in the past hour and send an email
  async checkForPriceIncrease(currentPrice: number, chain: string) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

    // Fetch the latest price from 1 hour ago
    const lastPrice = await this.priceRepository.findOne({
      where: { chain_name: chain, timestamp: MoreThanOrEqual(oneHourAgo) },
      order: { timestamp: 'ASC' },
    });

    if (lastPrice) {
      const percentageIncrease = ((currentPrice - lastPrice.price) / lastPrice.price) * 100;
      if (percentageIncrease >= 3) {
        await this.sendPriceAlert(chain, currentPrice, percentageIncrease);
      }
    }
  }

  // Send an email notification when the price increases by 3% or more
  // setUp ypur modemailer transport as GMAIL and Sendgrid does not allow testing purpose
  private async sendPriceAlert(chain: string, currentPrice: number, percentageIncrease: number) {
    const transporter = nodemailer.createTransport(
        {
          host:'smtp.ethereal.email',
      port:587,
      secure: false,
      auth: {
      user: 'shanon28@ethereal.email',  
      pass: 'AWShv4VSMdxajB4kWa',    
    },
      }
    
    )

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'hyperhire_assignment@hyperhire.in',  // Fixed recipient for alerts
      subject: `Price Alert: ${chain} Price Increased by ${percentageIncrease.toFixed(2)}%`,
      text: `The price of ${chain} has increased by ${percentageIncrease.toFixed(2)}% and is now $${currentPrice}.`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Price alert email sent for ${chain} to hyperhire_assignment@hyperhire.in`);
    } catch (error) {
      console.error('Error sending price alert email:', error);
    }
  
  }

  // Helper function to get the current price of the chain using the Moralis API
  private async getPrice(chain: string): Promise<number> {
    const apiKey = process.env.MORALIS_API_KEY;

  // Define contract addresses for ERC-20 tokens if needed
  let contractAddress = '';
  let chainName ='';

  if (chain === 'ethereum') {
    contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // Ethereum ERC-20 contract address
    chainName='eth'
  } else if (chain === 'polygon') {
    contractAddress = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'; // Polygon ERC-20 contract address
    chainName='polygon'
  }

  const url = `https://deep-index.moralis.io/api/v2.2/erc20/${contractAddress}/price?chain=${chainName}&include=percent_change`;

  const response = await axios.get(url, {
    headers: { 'X-API-Key': apiKey },
  });

  return response.data.usdPrice;
  }

  // Get prices for the last 24 hours
  async getPricesLast24Hours() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    return await this.priceRepository.find({
      where: { timestamp: MoreThanOrEqual(oneDayAgo) },
      order: { timestamp: 'DESC' }, // Sort by latest timestamp
    });
  }
}
