import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsIn, IsNumber } from 'class-validator';

export class PaymentResponseDto {
  @ApiProperty({
    example: 'Pago recibido correctamente',
    description: 'Mensaje que indica el estado de la operación de pago',
  })
  @IsString()
  message: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Identificador único de la transacción de pago',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({
    example: 'success',
    description: 'Estado general de la respuesta, puede ser success o failure',
    required: false,
  })
  @IsIn(['success', 'failure'])
  @IsOptional()
  status?: 'success' | 'failure';

  @ApiProperty({
    example: 200,
    description: 'Código HTTP que representa el resultado de la operación',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  statusCode?: number;
}
