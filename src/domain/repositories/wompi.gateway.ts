export interface WompiGateway {
  chargeCard(cardData: any): Promise<{ success: boolean; transactionId?: string }>;
  getAcceptanceToken(): Promise<{ success: boolean; acceptanceToken?: string }>;
  createTransaction(params: {
    amountInCents: number;
    currency: string;
    customerEmail: string;
    token: string;
    reference: string;
    acceptanceToken: string;
    installments: number;
  }): Promise<{ success: boolean; transactionId?: string }>;
  getTransactionStatus(transactionId: string): Promise<{ success: boolean; status?: string }>;
}