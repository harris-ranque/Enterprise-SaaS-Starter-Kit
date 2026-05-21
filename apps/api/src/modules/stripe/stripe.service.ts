import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../database/prisma.service';
import { STRIPE_CLIENT } from './stripe.client';

export type StripeConnectAccountResult =
  | { url: string }
  | { onboardingComplete: boolean };

@Injectable()
export class StripeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe.Stripe,
  ) {}

  // ================================
  // Create Stripe Connect Account
  // ================================
  async createStripeConnectAccount(
    userId: string,
  ): Promise<StripeConnectAccountResult> {
    const organization = await this.prisma.client.organization.findUnique({
      where: { ownerId: userId },
      select: {
        id: true,
        stripeAccountId: true,
        stripeOnboardingComplete: true,
      },
    });

    if (!organization) {
      throw new BadRequestException('Organization not found');
    }

    if (organization.stripeAccountId) {
      return {
        onboardingComplete: organization.stripeOnboardingComplete === true,
      };
    }

    const account = await this.stripe.accounts.create({
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await this.prisma.client.organization.update({
      where: { id: organization.id },
      data: { stripeAccountId: account.id },
    });

    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const accountLink = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${frontendUrl}/vendor/billing`,
      return_url: `${frontendUrl}/vendor/billing`,
      type: 'account_onboarding',
    });

    return { url: accountLink.url };
  }
}
