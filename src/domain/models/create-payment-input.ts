export interface CardData {
  cardNumber: string;
  cardHolderName: string;
  expirationMonth: number;
  expirationYear: number;
  cvc: string;
}

export interface CreatePaymentInput {
  productId: string;
  quantity: number;
  customerEmail: string;
  cardData: CardData;
  installments?: number;
}
