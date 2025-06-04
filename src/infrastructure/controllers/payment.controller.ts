import {
  Controller,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { CreatePaymentUseCase } from '../../app/use-cases/create-payment.usecase';
import { CreatePaymentDto } from '../../app/dtos/create-payment.dto';
import { PaymentResponseDto } from '../../app/dtos/payment-response.dto';
import { ErrorResponseDto } from '../../app/dtos/error-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly createPayment: CreatePaymentUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Realizar un pago' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'Pago exitoso', type: PaymentResponseDto })
  @ApiBadRequestResponse({ description: 'Error en la solicitud', type: ErrorResponseDto })
  async pay(@Body() body: CreatePaymentDto): Promise<PaymentResponseDto> {
    const result = await this.createPayment.execute(body);

    if (result.isFailure()) {
      throw new BadRequestException({ message: result.value });
    }

    return new PaymentResponseDto('Pago recibido correctamente');
  }
}
