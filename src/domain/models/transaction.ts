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
    private _status: TransactionStatus,
    public readonly wompiTransactionId?: string,
  ) {}

  get status(): TransactionStatus {
    return this._status;
  }

  public updateStatus(newStatus: TransactionStatus): void {
    if (this._status === TransactionStatus.SUCCESS) {
      throw new Error('No se puede cambiar el estado de una transacción exitosa.');
    }
    this._status = newStatus;
  }

  public static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public static create(
    id: string,
    productId: string,
    amount: number,
    customerEmail: string,
    wompiTransactionId?: string,
  ): Transaction {
    if (!this.validateEmail(customerEmail)) {
      throw new Error('Email no válido');
    }
    if (amount <= 0) {
      throw new Error('El monto debe ser mayor que cero');
    }
    return new Transaction(id, productId, amount, customerEmail, TransactionStatus.PENDING, wompiTransactionId);
  }
}
