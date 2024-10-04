// src/price/price.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Price {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chain_name: string;

  @Column('decimal')
  price: number;

  @Column()
  timestamp: Date;
}
