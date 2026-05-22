import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth/jwt-auth.guard';
import { AuthModule } from '../auth/auth.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { stripeClientProvider } from './stripe.client';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

@Module({
  imports: [AuthModule, RealtimeModule],
  providers: [StripeService, JwtAuthGuard, stripeClientProvider],
  controllers: [StripeController],
})
export class StripeModule {}
