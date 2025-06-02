import { Injectable } from '@nestjs/common';
import { TransactionRepository } from '../../../domain/repositories/transaction.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from '../entities/transaction.entity';
import { Transaction, TransactionStatus } from '../../../domain/models/transaction';

@Injectable()
export class TransactionRepositoryAdapter implements TransactionRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repo: Repository<TransactionEntity>,
  ) {}

  async create(transaction: Transaction): Promise<Transaction> {
    const entity = this.repo.create({
      id: transaction.id,
      productId: transaction.productId,
      amount: transaction.amount,
      deliveryAddress: transaction.deliveryAddress,
      status: transaction.status,
      wompiTransactionId: transaction.wompiTransactionId,
    });

    const saved = await this.repo.save(entity);

    return new Transaction(
      saved.id,
      saved.productId,
      Number(saved.amount),
      saved.deliveryAddress,
      saved.status as TransactionStatus,
      saved.wompiTransactionId,
    );
  }

  async updateStatus(id: string, status: TransactionStatus, wompiId?: string) {
    await this.repo.update(id, {
      status,
      wompiTransactionId: wompiId,
    });
  }
}
