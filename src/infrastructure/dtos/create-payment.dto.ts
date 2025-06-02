import { IsString, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

export class CardDataDto {
  @IsString() cardNumber: string;
  @IsString() cvc: string;
  @IsString() expMonth: string;
  @IsString() expYear: string;
  @IsString() cardHolder: string;
}

export class CreatePaymentDto {
  @IsString() productId: string;
  @IsString() deliveryAddress: string;
  @ValidateNested() cardData: CardDataDto;
}
