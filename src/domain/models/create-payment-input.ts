import { CardDataDto } from '../../app/dtos/create-payment.dto';

export interface CreatePaymentInput {
  productId: string;
  cantidad: number;
  customerEmail: string;
  cardData: CardDataDto;
  cuotas?: number;
}
