import { Module } from '@nestjs/common';
import { WompiGatewayAdapter } from './wompi.gateway.adapter';
import { WOMPI_REPOSITORY } from '../../domain/repositories/tokens';

@Module({
  providers: [{ provide: WOMPI_REPOSITORY, useClass: WompiGatewayAdapter }],
  exports: [WOMPI_REPOSITORY],
})
export class WompiModule {}
