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

  private toEntity(transaction: Transaction): TransactionEntity {
    return this.repo.create({
      id: transaction.id,
      productId: transaction.productId,
      amount: transaction.amount,
      customerEmail: transaction.customerEmail,
      status: transaction.status,
      wompiTransactionId: transaction.wompiTransactionId,
    });
  }

  private toDomain(entity: TransactionEntity): Transaction {
    return new Transaction(
      entity.id,
      entity.productId,
      Number(entity.amount),
      entity.customerEmail,
      entity.status as TransactionStatus,
      entity.wompiTransactionId,
    );
  }

  async create(transaction: Transaction): Promise<Transaction> {
    try {
      const entity = this.toEntity(transaction);
      const saved = await this.repo.save(entity);
      return this.toDomain(saved);
    } catch (error) {
      throw new Error(`Error saving transaction: ${error.message}`);
    }
  }

  async updateStatus(id: string, status: TransactionStatus, wompiId?: string) {
    const updateData: Partial<TransactionEntity> = { status };
    if (wompiId) {
      updateData.wompiTransactionId = wompiId;
    }
    await this.repo.update(id, updateData);
  }

  async findById(id: string): Promise<Transaction | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;
    return this.toDomain(entity);
  }
}

