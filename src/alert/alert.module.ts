import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { Alert } from './alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alert])], // Register the Alert entity
  exports:[AlertService],
  providers: [AlertService],
  controllers: [AlertController],
})
export class AlertModule {}
