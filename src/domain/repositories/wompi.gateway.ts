export interface WompiGateway {
  chargeCard(
    cardData: any
  ): Promise<{ success: boolean; transactionId?: string }>;
}