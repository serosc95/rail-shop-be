import {
  IsString,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
  IsEmail,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CardDataDto {
  @ApiProperty({ example: '4242424242424242', description: 'Número de la tarjeta' })
  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @ApiProperty({ example: '123', description: 'Código de seguridad (CVC)' })
  @IsString()
  @IsNotEmpty()
  cvc: string;

  @ApiProperty({ example: '12', description: 'Mes de expiración (MM)' })
  @IsString()
  @IsNotEmpty()
  expMonth: string;

  @ApiProperty({ example: '2025', description: 'Año de expiración (YYYY)' })
  @IsString()
  @IsNotEmpty()
  expYear: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre del titular' })
  @IsString()
  @IsNotEmpty()
  cardHolder: string;
}

export class CreatePaymentDto {
  @ApiProperty({ example: 'prod_123', description: 'ID del producto' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2, description: 'Cantidad del producto' })
  @IsNumber()
  @Min(1)
  cantidad: number;

  @ApiProperty({ example: 'cliente@email.com', description: 'Correo del cliente' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ example: 3, description: 'Número de cuotas a pagar' })
  @IsNumber()
  @Min(1)
  cuotas: number;

  @ApiProperty({ type: () => CardDataDto, description: 'Datos de la tarjeta' })
  @ValidateNested()
  @Type(() => CardDataDto)
  cardData: CardDataDto;
}
