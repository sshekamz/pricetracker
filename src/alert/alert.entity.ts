import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chain_name: string;

  @Column('decimal')
  alert_price: number;

  @Column()
  email: string;

  @Column({ default: false })
  alert_triggered: boolean;  // Prevent multiple emails for the same alert
}
