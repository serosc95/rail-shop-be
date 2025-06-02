export interface WompiGateway {
  chargeCard(
    cardData: any,
    amount: number
  ): Promise<{ success: boolean; transactionId?: string }>;
}