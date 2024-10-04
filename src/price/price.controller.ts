import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PriceService } from './price.service';

@ApiTags('Prices')
@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  // Get the prices of Ethereum and Polygon for the last 24 hours
  @Get('last24hours')
  async getLast24Hours() {
    return await this.priceService.getPricesLast24Hours();
  }
}
