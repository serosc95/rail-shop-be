import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WompiGateway } from '../../domain/repositories/wompi.gateway';
import axios from 'axios';

@Injectable()
export class WompiGatewayAdapter implements WompiGateway {

  constructor(private readonly configService: ConfigService) {}
  async chargeCard(cardData: any): Promise<{ success: boolean; transactionId?: string }> {
    const response = await axios.post(`${this.configService.get<string>('WOMPI_API_URL')}/tokens/cards`, {
        number: cardData.cardNumber,
        cvc: cardData.cvc,
        exp_month: cardData.expMonth,
        exp_year: cardData.expYear,
        card_holder: cardData.cardHolder
    }, {
      headers: {
        Authorization: `Bearer ${this.configService.get<string>('WOMPI_PUBLIC_KEY')}`
      }
    });

    if (response.data.status === 'CREATED') {
      return { success: true, transactionId: response.data.data.id };
    } else {
      return { success: false };
    }
  }

  async getAcceptanceToken(): Promise<{ success: boolean; acceptanceToken?: string }> {
    try {
      const publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY');
      const response = await axios.get(`${this.configService.get<string>('WOMPI_API_URL')}/merchants/${publicKey}`);
      const token = response.data.data.presigned_acceptance.acceptance_token;
      return { success: true, acceptanceToken: token };
    } catch (error) {
      return { success: false };
    }
  }

  async createTransaction(params: {
    amountInCents: number;
    currency: string;
    customerEmail: string;
    token: string;
    reference: string;
    acceptanceToken: string;
    installments: number;
  }): Promise<{ success: boolean; transactionId?: string }> {
    try {
      const integrityKey = this.configService.get<string>('WOMPI_INTEGRITY_KEY');

      const cadenaConcatenada = `${params.reference}${params.amountInCents}${params.currency}${integrityKey}`;
      const encondedText = new TextEncoder().encode(cadenaConcatenada);
      const hashBuffer = await crypto.subtle.digest('SHA-256', encondedText);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const body = {
        amount_in_cents: Number(params.amountInCents),
        currency: params.currency,
        customer_email: params.customerEmail,
        payment_method: {
          type: 'CARD',
          installments: params.installments,
          token: params.token,
        },
        reference: params.reference,
        acceptance_token: params.acceptanceToken,
        signature,
      };
      const response = await axios.post(`${this.configService.get<string>('WOMPI_API_URL')}/transactions`, body, {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>('WOMPI_PUBLIC_KEY')}`
        }
      });

      const transactionId = response.data.data.id;
      return { success: true, transactionId };
    } catch (error) {
      return { success: false };
    }
  }

  async getTransactionStatus(transactionId: string): Promise<{ success: boolean; status?: string }> {
    try {
      const response = await axios.get(`${this.configService.get<string>('WOMPI_API_URL')}/transactions/${transactionId}`);
      const status = response.data.data.status;
      return { success: true, status };
    } catch (error) {
      return { success: false };
    }
  }
}