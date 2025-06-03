import {
  Controller,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { CreatePaymentUseCase } from '../../app/use-cases/create-payment.usecase';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { PaymentResponseDto } from '../dtos/payment-response.dto';
import { ErrorResponseDto } from '../dtos/error-response.dto';
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
  @ApiBadRequestResponse({ description: 'Producto no encontrado', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Producto sin stock disponible', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Error al procesar el pago con Wompi', type: ErrorResponseDto })
  async pay(@Body() body: CreatePaymentDto) {
    const result = await this.createPayment.execute(body);
    if (result.isFailure()) {
      throw new BadRequestException({ error: result.value });
    }
    return { message: 'Pago recibido correctamente' };
  }
}
