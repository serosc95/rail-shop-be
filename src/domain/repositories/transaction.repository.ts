import { Transaction, TransactionStatus } from '../models/transaction';

export interface TransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  updateStatus(transactionId: string, status: TransactionStatus, wompiTransactionId?: string): Promise<void>;
}