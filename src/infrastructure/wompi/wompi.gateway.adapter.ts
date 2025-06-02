import { Injectable } from '@nestjs/common';
import { WompiGateway } from '../../domain/repositories/wompi.gateway';

@Injectable()
export class WompiGatewayAdapter implements WompiGateway {
  async chargeCard(cardData: any, amount: number): Promise<{ success: boolean; transactionId?: string }> {
    return { success: true, transactionId: 'wompi_tx_123' };
  }
}