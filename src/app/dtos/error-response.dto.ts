import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 'ProductNotFound', description: 'Tipo de error' })
  error: string;

  @ApiProperty({ example: 'El producto con id 123 no fue encontrado.', description: 'Mensaje descriptivo del error' })
  message: string;

  @ApiProperty({ example: 404, description: 'Código HTTP del error' })
  statusCode: number;

  @ApiPropertyOptional({ example: { productId: '123' }, description: 'Detalles adicionales del error' })
  details?: Record<string, any>;
}
