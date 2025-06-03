export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly amount: number,
    public readonly customerEmail: string,
    public status: TransactionStatus,
    public wompiTransactionId?: string,
  ) {}
}