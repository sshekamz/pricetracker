import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { AlertService } from './alert.service';
import { CreateAlertDto } from './alert.dto';

@ApiTags('Alerts')  // Grouped under "Alerts" in Swagger
@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  // Endpoint to set a new price alert
  @Post('set')
  @ApiBody({ type: CreateAlertDto })  // Specify the body schema for Swagger
  async setAlert(@Body() createAlertDto: CreateAlertDto) {
    return await this.alertService.setPriceAlert(createAlertDto.chain, createAlertDto.price, createAlertDto.email);
  }
}
