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

  async execute(input: any): Promise<Result<'PaymentSuccess', 'ProductNotFound' | 'OutOfStock' | 'PaymentFailed'>> {
    const product = await this.productRepo.findById(input.productId);
    if (!product) return fail('ProductNotFound');

    if (product.stock <= 0 || product.stock < input.cantidad) return fail('OutOfStock');

    const total = product.price * input.cantidad;

    const transaction = new Transaction(
      crypto.randomUUID(),
      product.id,
      total,
      input.customerEmail,
      TransactionStatus.PENDING
    );
    await this.transactionRepo.create(transaction);

    const tokenCard = await this.wompi.chargeCard(input.cardData);
    if (!tokenCard.success) {
      await this.transactionRepo.updateStatus(transaction.id, TransactionStatus.FAILED);
      return fail('PaymentFailed');
    }
    
    const tokenAcceptance = await this.wompi.getAcceptanceToken();
    if (!tokenAcceptance.success) {
      await this.transactionRepo.updateStatus(transaction.id, TransactionStatus.FAILED);
      return fail('PaymentFailed');
    }

    const transactionId = await this.wompi.createTransaction({
      amountInCents: total,
      currency: "COP",
      customerEmail: input.customerEmail,
      token: tokenCard.transactionId!,
      reference: crypto.randomUUID(),
      acceptanceToken: tokenAcceptance.acceptanceToken!,
      installments: input.cuotas,
    });
    if (!transactionId.success) {
      await this.transactionRepo.updateStatus(transaction.id, TransactionStatus.FAILED);
      return fail('PaymentFailed');
    }

    const maxRetries = 5;
    let delayMs = 3000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {

      const transactionStatus = await this.wompi.getTransactionStatus(transactionId.transactionId!);
      if (!transactionStatus.success) {
        await this.transactionRepo.updateStatus(transaction.id, TransactionStatus.FAILED, transactionId.transactionId!);
        return fail('PaymentFailed');
      }
  
      const status = transactionStatus.status;
  
      if (status === 'APPROVED') {
        await this.transactionRepo.updateStatus(transaction.id, TransactionStatus.SUCCESS, transactionId.transactionId!);
        await this.productRepo.updateStock(product.id, product.stock - input.cantidad);
        return ok('PaymentSuccess');      
      }
  
      if (status === 'DECLINED' || status === 'VOIDED') {
        await this.transactionRepo.updateStatus(transaction.id, TransactionStatus.FAILED, transactionId.transactionId!);
        return fail('PaymentFailed');
      }
  
      if (status === 'PENDING' && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2; 
      } else if (status === 'PENDING') {
        await this.transactionRepo.updateStatus(transaction.id, TransactionStatus.FAILED, transactionId.transactionId!);
        return fail('PaymentFailed');
      }
    }

    await this.transactionRepo.updateStatus(transaction.id, TransactionStatus.FAILED, transactionId.transactionId!);
    return fail('PaymentFailed');
  }
}