import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty({ example: 'Pago recibido correctamente' })
  message: string;
}
