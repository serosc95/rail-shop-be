import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from '../../../src/infrastructure/controllers/payment.controller';
import { CreatePaymentUseCase, CreatePaymentErrors } from '../../../src/app/usecases/create-payment.usecase';
import { CreatePaymentDto } from '../../../src/app/dtos/create-payment.dto';
import { BadRequestException } from '@nestjs/common';
import { Result, Failure, Success } from '../../../src/shared/rop';
import { PaymentResponseDto } from '../../../src/app/dtos/payment-response.dto';

describe('PaymentController', () => {
  let controller: PaymentController;
  let createPaymentUseCase: CreatePaymentUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: CreatePaymentUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    createPaymentUseCase = module.get<CreatePaymentUseCase>(CreatePaymentUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return success response when payment is created', async () => {
    const dto: CreatePaymentDto = {
      productId: 'prod_123',
      cantidad: 2,
      customerEmail: 'cliente@ejemplo.com',
      cuotas: 3,
      cardData: {
        cardNumber: '4111111111111111',
        cardHolder: 'Juan Perez',
        expYear: '26',
        cvc: '123',
        expMonth: '08',
      },
    };

    const mockSuccess: Success<"PaymentSuccess"> = {
      isFailure(): this is Failure<never> {
        return false;
      },
      isSuccess(): this is Success<never> {
        return true;
      },
      value: "PaymentSuccess",
      type: 'success',
      map: jest.fn(),
      mapError: jest.fn(),
    };
    

    jest.spyOn(createPaymentUseCase, 'execute').mockResolvedValueOnce(mockSuccess);

    const response = await controller.pay(dto);

    expect(response).toEqual(new PaymentResponseDto('Pago recibido correctamente'));
    expect(createPaymentUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should throw BadRequestException when use case fails', async () => {
    const dto: CreatePaymentDto = {
      productId: 'prod_123',
      cantidad: 2,
      customerEmail: 'cliente@ejemplo.com',
      cuotas: 3,
      cardData: {
        cardNumber: '4111111111111111',
        cardHolder: 'Juan Perez',
        expYear: '26',
        cvc: '123',
        expMonth: '08',
      },
    };
  
    const mockFailure: Failure<CreatePaymentErrors> = {
      isFailure(): this is Failure<never> {
        return true;
      },
      isSuccess(): this is Success<never> {
        return false;
      },
      value: CreatePaymentErrors.ProductNotFound,
      type: 'failure',
      map: jest.fn(),
      mapError: jest.fn(),
    };
  
    jest.spyOn(createPaymentUseCase, 'execute').mockResolvedValueOnce(mockFailure);
  
    await expect(controller.pay(dto)).rejects.toThrowError(
      new BadRequestException(CreatePaymentErrors.ProductNotFound),
    );
  });
});
