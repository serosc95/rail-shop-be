import { CreatePaymentUseCase, CreatePaymentErrors } from '../../../src/app/usecases/create-payment.usecase';
import { TransactionStatus } from '../../../src/domain/models/transaction';

const mockProductRepo = () => ({
  findById: jest.fn(),
  updateStock: jest.fn(),
});

const mockTransactionRepo = () => ({
  create: jest.fn(),
  updateStatus: jest.fn(),
});

const mockWompiGateway = () => ({
  chargeCard: jest.fn(),
  getAcceptanceToken: jest.fn(),
  createTransaction: jest.fn(),
  getTransactionStatus: jest.fn(),
});

describe('CreatePaymentUseCase', () => {
  let useCase: CreatePaymentUseCase;
  let productRepo: ReturnType<typeof mockProductRepo>;
  let transactionRepo: ReturnType<typeof mockTransactionRepo>;
  let wompi: ReturnType<typeof mockWompiGateway>;

  const fakeInput = {
    productId: 'product-1',
    cantidad: 2,
    customerEmail: 'customer@test.com',
    cardData: { number: '1234-5678-9012-3456' },
    cuotas: 1,
  };

  beforeEach(() => {
    productRepo = mockProductRepo();
    transactionRepo = mockTransactionRepo();
    wompi = mockWompiGateway();

    useCase = new CreatePaymentUseCase(productRepo as any, transactionRepo as any, wompi as any);

    // Mock sleep para evitar delays reales en tests
    jest.spyOn(global, 'setTimeout').mockImplementation((fn: Function) => {
      fn();
      return 0 as any;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fail if product not found', async () => {
    productRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute(fakeInput);

    expect(result.isFailure()).toBe(true);
    expect('ProductNotFound').toBe(CreatePaymentErrors.ProductNotFound);
  });

  it('should fail if product stock is insufficient', async () => {
    productRepo.findById.mockResolvedValue({ id: 'product-1', stock: 1, price: 100 });

    const result = await useCase.execute({ ...fakeInput, cantidad: 2 });

    expect(result.isSuccess()).toBe(false);
    expect("OutOfStock").toBe(CreatePaymentErrors.OutOfStock);
  });

  it('should fail if wompi chargeCard fails', async () => {
    productRepo.findById.mockResolvedValue({ id: 'product-1', stock: 5, price: 100 });
    transactionRepo.create.mockResolvedValue(undefined);
    wompi.chargeCard.mockResolvedValue({ success: false });

    const result = await useCase.execute(fakeInput);

    expect(transactionRepo.updateStatus).toHaveBeenCalledWith(expect.any(String), TransactionStatus.FAILED);
    expect(result.isSuccess()).toBe(false);
    expect("PaymentFailed").toBe(CreatePaymentErrors.PaymentFailed);
  });

  it('should fail if wompi getAcceptanceToken fails', async () => {
    productRepo.findById.mockResolvedValue({ id: 'product-1', stock: 5, price: 100 });
    transactionRepo.create.mockResolvedValue(undefined);
    wompi.chargeCard.mockResolvedValue({ success: true, transactionId: 'txn-1' });
    wompi.getAcceptanceToken.mockResolvedValue({ success: false });

    const result = await useCase.execute(fakeInput);

    expect(transactionRepo.updateStatus).toHaveBeenCalledWith(expect.any(String), TransactionStatus.FAILED);
    expect(result.isSuccess()).toBe(false);
    expect("PaymentFailed").toBe(CreatePaymentErrors.PaymentFailed);
  });

  it('should fail if wompi createTransaction fails', async () => {
    productRepo.findById.mockResolvedValue({ id: 'product-1', stock: 5, price: 100 });
    transactionRepo.create.mockResolvedValue(undefined);
    wompi.chargeCard.mockResolvedValue({ success: true, transactionId: 'txn-1' });
    wompi.getAcceptanceToken.mockResolvedValue({ success: true, acceptanceToken: 'token-1' });
    wompi.createTransaction.mockResolvedValue({ success: false });

    const result = await useCase.execute(fakeInput);

    expect(transactionRepo.updateStatus).toHaveBeenCalledWith(expect.any(String), TransactionStatus.FAILED);
    expect(result.isSuccess()).toBe(false);
    expect("PaymentFailed").toBe(CreatePaymentErrors.PaymentFailed);
  });

  it('should succeed when payment is approved', async () => {
    productRepo.findById.mockResolvedValue({ id: 'product-1', stock: 5, price: 100 });
    transactionRepo.create.mockResolvedValue(undefined);
    wompi.chargeCard.mockResolvedValue({ success: true, transactionId: 'txn-1' });
    wompi.getAcceptanceToken.mockResolvedValue({ success: true, acceptanceToken: 'token-1' });
    wompi.createTransaction.mockResolvedValue({ success: true, transactionId: 'txn-2' });
    wompi.getTransactionStatus.mockResolvedValue({ success: true, status: 'APPROVED' });

    const result = await useCase.execute(fakeInput);

    expect(transactionRepo.updateStatus).toHaveBeenCalledWith(expect.any(String), TransactionStatus.SUCCESS, 'txn-2');
    expect(productRepo.updateStock).toHaveBeenCalledWith('product-1', 3);
    expect(result.isSuccess()).toBe(true);
    expect('PaymentSuccess').toBe('PaymentSuccess');
  });

  it('should fail if transaction is declined', async () => {
    productRepo.findById.mockResolvedValue({ id: 'product-1', stock: 5, price: 100 });
    transactionRepo.create.mockResolvedValue(undefined);
    wompi.chargeCard.mockResolvedValue({ success: true, transactionId: 'txn-1' });
    wompi.getAcceptanceToken.mockResolvedValue({ success: true, acceptanceToken: 'token-1' });
    wompi.createTransaction.mockResolvedValue({ success: true, transactionId: 'txn-2' });
    wompi.getTransactionStatus.mockResolvedValue({ success: true, status: 'DECLINED' });

    const result = await useCase.execute(fakeInput);

    expect(transactionRepo.updateStatus).toHaveBeenCalledWith(expect.any(String), TransactionStatus.FAILED, 'txn-2');
    expect(result.isSuccess()).toBe(false);
    expect("PaymentFailed").toBe(CreatePaymentErrors.PaymentFailed);
  });

  it('should handle polling pending status and then approved', async () => {
    productRepo.findById.mockResolvedValue({ id: 'product-1', stock: 5, price: 100 });
    transactionRepo.create.mockResolvedValue(undefined);
    wompi.chargeCard.mockResolvedValue({ success: true, transactionId: 'txn-1' });
    wompi.getAcceptanceToken.mockResolvedValue({ success: true, acceptanceToken: 'token-1' });
    wompi.createTransaction.mockResolvedValue({ success: true, transactionId: 'txn-2' });

    // Simula 2 estados PENDING y luego APPROVED
    const statuses = [
      { success: true, status: 'PENDING' },
      { success: true, status: 'PENDING' },
      { success: true, status: 'APPROVED' },
    ];
    wompi.getTransactionStatus.mockImplementation(() => Promise.resolve(statuses.shift() || { success: false }));

    const result = await useCase.execute(fakeInput);

    expect(transactionRepo.updateStatus).toHaveBeenCalledWith(expect.any(String), TransactionStatus.SUCCESS, 'txn-2');
    expect(result.isSuccess()).toBe(true);
  });

  it('should return UNKNOWN if getTransactionStatus fails', async () => {
    // Probar directamente pollTransactionStatus vía execucción indirecta
    productRepo.findById.mockResolvedValue({ id: 'product-1', stock: 5, price: 100 });
    transactionRepo.create.mockResolvedValue(undefined);
    wompi.chargeCard.mockResolvedValue({ success: true, transactionId: 'txn-1' });
    wompi.getAcceptanceToken.mockResolvedValue({ success: true, acceptanceToken: 'token-1' });
    wompi.createTransaction.mockResolvedValue({ success: true, transactionId: 'txn-2' });

    wompi.getTransactionStatus.mockResolvedValue({ success: false });

    const result = await useCase.execute(fakeInput);

    expect(transactionRepo.updateStatus).toHaveBeenCalledWith(expect.any(String), TransactionStatus.FAILED, 'txn-2');
    expect(result.isSuccess()).toBe(false);
    expect("PaymentFailed").toBe(CreatePaymentErrors.PaymentFailed);
  });

  it('should return PENDING if polling reaches max retries with PENDING status', async () => {
    productRepo.findById.mockResolvedValue({ id: 'product-1', stock: 5, price: 100 });
    transactionRepo.create.mockResolvedValue(undefined);
    wompi.chargeCard.mockResolvedValue({ success: true, transactionId: 'txn-1' });
    wompi.getAcceptanceToken.mockResolvedValue({ success: true, acceptanceToken: 'token-1' });
    wompi.createTransaction.mockResolvedValue({ success: true, transactionId: 'txn-2' });

    // Simula siempre PENDING para todos los reintentos
    wompi.getTransactionStatus.mockResolvedValue({ success: true, status: 'PENDING' });

    const result = await useCase.execute(fakeInput);

    expect(transactionRepo.updateStatus).toHaveBeenCalledWith(expect.any(String), TransactionStatus.FAILED, 'txn-2');
    expect(result.isSuccess()).toBe(false);
    expect("PaymentFailed").toBe(CreatePaymentErrors.PaymentFailed);
  });
});
