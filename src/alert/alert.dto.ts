import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAlertDto {
  @ApiProperty({ example: 'ethereum', description: 'The chain name (ethereum or polygon)' })
  @IsString()
  @IsNotEmpty()
  chain: string;

  @ApiProperty({ example: 2500, description: 'The target price for the alert' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 'user@example.com', description: 'The email to send the alert' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
