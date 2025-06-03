import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({ example: '00000000-0000-0000-0000-000000000000', description: 'ID del producto' })
  id: string;

  @ApiProperty({ example: 'Zapatos deportivos', description: 'Nombre del producto' })
  name: string;

  @ApiProperty({ example: 'Zapatillas cómodas para correr', description: 'Descripción' })
  description: string;

  @ApiProperty({ example: 500000, description: 'Precio del producto' })
  price: number;

  @ApiProperty({ example: 100, description: 'Cantidad disponible del producto' })
  stock: number;
}
