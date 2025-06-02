import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { CreatePaymentUseCase } from '../../app/use-cases/create-payment.usecase';
import { CreatePaymentDto } from '../dtos/create-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly createPayment: CreatePaymentUseCase) {}

  @Post()
  async pay(@Body() body: CreatePaymentDto) {
    const result = await this.createPayment.execute(body);
    if (result.isFailure()) {
      throw new BadRequestException(result.value);
    }
    return { status: 'ok' };
  }
}