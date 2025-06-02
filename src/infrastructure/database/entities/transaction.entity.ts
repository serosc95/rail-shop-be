import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() productId: string;
  @Column() deliveryAddress: string;
  @Column('decimal') amount: number;
  @Column() status: string;
  @Column({ nullable: true }) wompiTransactionId: string;
}
