import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { Price } from './price.entity';
//import { AlertService } from 'src/alert/alert.service';
import { AlertModule } from 'src/alert/alert.module';

@Module({
  imports: [TypeOrmModule.forFeature([Price]), AlertModule], // Register the Price entity
  providers: [PriceService],
  controllers: [PriceController],
})
export class PriceModule {}
