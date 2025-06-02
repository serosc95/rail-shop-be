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
}