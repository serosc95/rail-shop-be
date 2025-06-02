import { ok, fail, Result } from '../../shared/rop';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { TransactionRepository } from '../../domain/repositories/transaction.repository';
import { WompiGateway } from '../../domain/repositories/wompi.gateway';
import { Transaction, TransactionStatus } from '../../domain/models/transaction';

export class CreatePaymentUseCase {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly transactionRepo: TransactionRepository,
    private readonly wompi: WompiGateway,
  ) {}

  async execute(input: {
    productId: string;
    cardData: any;
    deliveryAddress: string;
  }): Promise<Result<'PaymentSuccess', 'ProductNotFound' | 'OutOfStock' | 'PaymentFailed'>> {
    const product = await this.productRepo.findById(input.productId);
    if (!product) return fail('ProductNotFound');

    if (product.stock <= 0) return fail('OutOfStock');

    const total = product.price + 5 + 10;

    const transaction = new Transaction(
      crypto.randomUUID(),
      product.id,
      total,
      input.deliveryAddress,
      TransactionStatus.PENDING
    );

    await this.transactionRepo.create(transaction);

    const result = await this.wompi.chargeCard(input.cardData, total);
    if (!result.success) {
      await this.transactionRepo.updateStatus(transaction.id, TransactionStatus.FAILED);
      return fail('PaymentFailed');
    }

    await this.transactionRepo.updateStatus(transaction.id, TransactionStatus.SUCCESS, result.transactionId);
    await this.productRepo.updateStock(product.id, product.stock - 1);

    return ok('PaymentSuccess');
  }
}