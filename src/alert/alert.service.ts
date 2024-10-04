import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './alert.entity';
import * as nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

@Injectable()
export class AlertService {
  
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
  ) {}

  private transporter = nodemailer.createTransport({

      host:'smtp.ethereal.email',
      port:587,
      secure: false,
      auth: {
      user: 'shanon28@ethereal.email',  // Use Mailgun API key from .env
      pass: 'AWShv4VSMdxajB4kWa',    // Use Mailgun domain from .env
    },
  })
  // Set a new alert for a specific chain and price
  async setPriceAlert(chain: string, price: number, email: string) {
    const newAlert = this.alertRepository.create({
      chain_name: chain,
      alert_price: price,
      email: email,
    });

    return await this.alertRepository.save(newAlert);
  }

  // Check if the price crosses the alert threshold and send an email if necessary
  async checkAlerts(currentPrice: number, chain: string) {
    const alerts = await this.alertRepository.find({
      where: { chain_name: chain, alert_triggered: false },
    });

    for (const alert of alerts) {
      if (currentPrice >= alert.alert_price) {
        await this.sendAlertEmail(alert.email, chain, alert.alert_price);
        alert.alert_triggered = true;  // Mark the alert as triggered to avoid duplicate emails
        await this.alertRepository.save(alert);
      }
    }
  }

  // Send an email when the price crosses the alert threshold
  private async sendAlertEmail(email: string, chain: string, alertPrice: number) {
    const mailOptions = {
      from: process.env.EMAIL_USER,  // Sender's email (must be your Mailgun verified email)
      to: email,                     // Recipient email
      subject: `Price Alert for ${chain}`,
      text: `The price of ${chain} has reached ${alertPrice}.`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Alert email sent to ${email} for ${chain}`);
    } catch (error) {
      console.error('Error sending price alert email:', error);
    }
  }

}
