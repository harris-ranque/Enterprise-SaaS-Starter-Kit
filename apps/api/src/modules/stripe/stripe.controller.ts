import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';
import {
  StripeService,
  type StripeConnectAccountResult,
} from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  // =========================================
  // Connect Stripe Account
  // =========================================
  @UseGuards(JwtAuthGuard)
  @Get('connect')
  connectStripeAccount(
    @Req() req: AuthenticatedRequest,
  ): Promise<StripeConnectAccountResult> {
    return this.stripeService.createStripeConnectAccount(req.user.sub);
  }
}
