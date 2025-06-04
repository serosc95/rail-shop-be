import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class ProductDto {
  @ApiProperty({
    example: '00000000-0000-0000-0000-000000000000',
    description: 'ID del producto',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'El id debe ser un UUID válido' })
  id: string;

  @ApiProperty({ example: 'Zapatos deportivos', description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiProperty({ example: 'Zapatillas cómodas para correr', description: 'Descripción' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 500000, description: 'Precio del producto' })
  @IsNumber()
  @Min(0, { message: 'El precio debe ser un número positivo' })
  price: number;

  @ApiProperty({ example: 100, description: 'Cantidad disponible del producto' })
  @IsNumber()
  @Min(0, { message: 'El stock debe ser un número positivo' })
  stock: number;
}
