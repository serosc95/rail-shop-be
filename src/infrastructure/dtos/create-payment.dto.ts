import {
  IsString,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
  IsEmail,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CardDataDto {
  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @IsString()
  @IsNotEmpty()
  cvc: string;

  @IsString()
  @IsNotEmpty()
  expMonth: string;

  @IsString()
  @IsNotEmpty()
  expYear: string;

  @IsString()
  @IsNotEmpty()
  cardHolder: string;
}

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  cantidad: number;

  @IsEmail()
  customerEmail: string;

  @IsNumber()
  @Min(1)
  cuotas: number;

  @ValidateNested()
  @Type(() => CardDataDto)
  cardData: CardDataDto;
}
