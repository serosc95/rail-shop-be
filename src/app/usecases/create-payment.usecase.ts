import { Injectable, Inject } from '@nestjs/common';
import { ok, fail, Result } from '../../shared/rop';
import { PRODUCT_REPOSITORY, TRANSACTION_REPOSITORY, WOMPI_REPOSITORY } from '../../domain/repositories/tokens';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { TransactionRepository } from '../../domain/repositories/transaction.repository';
import { WompiGateway } from '../../domain/repositories/wompi.gateway';
import { Transaction, TransactionStatus } from '../../domain/models/transaction';

export enum CreatePaymentErrors {
  ProductNotFound = 'ProductNotFound',
  OutOfStock = 'OutOfStock',
  PaymentFailed = 'PaymentFailed',
}

interface CreatePaymentInput {
  productId: string;
  cantidad: number;
  customerEmail: string;
  cardData: any;
  cuotas: number;
}

@Injectable()
export class CreatePaymentUseCase {
  private readonly maxRetries = 5;
  private readonly initialDelay = 3000;

  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepo: ProductRepository,
    @Inject(TRANSACTION_REPOSITORY) private readonly transactionRepo: TransactionRepository,
    @Inject(WOMPI_REPOSITORY) private readonly wompi: WompiGateway,
  ) {}

  async execute(input: CreatePaymentInput): Promise<Result<'PaymentSuccess', CreatePaymentErrors>> {
    const product = await this.productRepo.findById(input.productId);
    if (!product) return fail(CreatePaymentErrors.ProductNotFound);

    if (product.stock < input.cantidad) return fail(CreatePaymentErrors.OutOfStock);

    const total = this.calculateTotal(product.price, input.cantidad);

    const transaction = this.createInitialTransaction(product.id, total, input.customerEmail);
    await this.transactionRepo.create(transaction);

    const wompiResult = await this.processWompiTransaction(input, total);
    if (!wompiResult.success || !wompiResult.transactionId) {
      await this.transactionRepo.updateStatus(transaction.id, TransactionStatus.FAILED);
      return fail(CreatePaymentErrors.PaymentFailed);
    }

    const status = await this.pollTransactionStatus(wompiResult.transactionId);
    if (status === 'APPROVED') {
      await this.transactionRepo.updateStatus(transaction.id, TransactionStatus.SUCCESS, wompiResult.transactionId);
      await this.productRepo.updateStock(product.id, product.stock - input.cantidad);
      return ok('PaymentSuccess');
    }

    await this.transactionRepo.updateStatus(transaction.id, TransactionStatus.FAILED, wompiResult.transactionId);
    return fail(CreatePaymentErrors.PaymentFailed);
  }

  private createInitialTransaction(
    productId: string,
    total: number,
    customerEmail: string,
  ): Transaction {
    return new Transaction(
      crypto.randomUUID(),
      productId,
      total,
      customerEmail,
      TransactionStatus.PENDING
    );
  }

  private calculateTotal(price: number, cantidad: number): number {
    return price * cantidad;
  }

  private async processWompiTransaction(input: CreatePaymentInput, total: number): Promise<{ success: boolean, transactionId?: string }> {
    const cardTokenResult = await this.wompi.chargeCard(input.cardData);
    if (!cardTokenResult.success || !cardTokenResult.transactionId) return { success: false };

    const acceptanceTokenResult = await this.wompi.getAcceptanceToken();
    if (!acceptanceTokenResult.success || !acceptanceTokenResult.acceptanceToken) return { success: false };

    const wompiTransaction = await this.wompi.createTransaction({
      amountInCents: total,
      currency: 'COP',
      customerEmail: input.customerEmail,
      token: cardTokenResult.transactionId,
      reference: crypto.randomUUID(),
      acceptanceToken: acceptanceTokenResult.acceptanceToken,
      installments: input.cuotas,
    });

    if (!wompiTransaction.success || !wompiTransaction.transactionId) return { success: false };

    return { success: true, transactionId: wompiTransaction.transactionId };
  }

  private async pollTransactionStatus(transactionId: string): Promise<'APPROVED' | 'DECLINED' | 'VOIDED' | 'PENDING' | 'UNKNOWN'> {
    let delay = this.initialDelay;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      const statusResult = await this.wompi.getTransactionStatus(transactionId);

      if (!statusResult.success) return 'UNKNOWN';

      const status = statusResult.status;

      if (status === 'APPROVED') return 'APPROVED';
      if (status === 'DECLINED' || status === 'VOIDED') return status;

      if (status === 'PENDING' && attempt < this.maxRetries) {
        await this.sleep(delay);
        delay *= 2;
      }
    }

    return 'PENDING';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
