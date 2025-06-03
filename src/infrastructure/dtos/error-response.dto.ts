import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 'ProductNotFound', description: 'Tipo de error' })
  error: string;
}
