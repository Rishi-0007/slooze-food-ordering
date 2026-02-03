import { Module } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsResolver } from './payment-methods.resolver';

@Module({
  providers: [PaymentMethodsService, PaymentMethodsResolver],
  exports: [PaymentMethodsService],
})
export class PaymentMethodsModule {}
