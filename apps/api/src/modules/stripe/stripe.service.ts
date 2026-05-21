import {
  Inject,
  Injectable,
  BadRequestException,
  type RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import Stripe from 'stripe';
import { PrismaService } from '../../database/prisma.service';
import { STRIPE_CLIENT } from './stripe.client';

export type StripeConnectAccountResult =
  | { url: string }
  | { onboardingComplete: boolean };

export type StripeWebhookResponse = { received: boolean };

export type StripePaymentIntentResult = {
  clientSecret: string;
  paymentIntentId: string;
};

type StripeEvent = ReturnType<Stripe.Stripe['webhooks']['constructEvent']>;
type StripePaymentIntent = Extract<
  StripeEvent,
  { type: 'payment_intent.succeeded' }
>['data']['object'];

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

  // ================================
  // Handle Stripe Webhook
  // ================================
  async handleStripeWebhook(
    req: RawBodyRequest<Request>,
    signature: string,
  ): Promise<StripeWebhookResponse> {
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret is not configured');
    }

    let event: StripeEvent;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown webhook error';
      throw new BadRequestException(`Webhook Error: ${message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  // ================================
  // Payment Intent Succeeded
  // ================================
  async handlePaymentIntentSucceeded(
    paymentIntent: StripePaymentIntent,
  ): Promise<void> {
    const payment = await this.prisma.findPaymentByStripePaymentIntentId(
      paymentIntent.id,
    );

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    await this.prisma.updatePaymentStatus(payment.id, 'SUCCEEDED');

    console.log(`Payment ${payment.id} succeeded`);
  }

  // ================================
  // Payment Intent Failed
  // ================================
  async handlePaymentIntentFailed(
    paymentIntent: StripePaymentIntent,
  ): Promise<void> {
    const payment = await this.prisma.findPaymentByStripePaymentIntentId(
      paymentIntent.id,
    );

    if (!payment) {
      return;
    }

    await this.prisma.updatePaymentStatus(payment.id, 'FAILED');

    console.log(`Payment ${payment.id} failed`);
  }

  async createStripePaymentIntent(
    organizationId: string,
    amount: number,
  ): Promise<StripePaymentIntentResult> {
    // ================================
    // Find Organization
    // ================================

    const organization = await this.prisma.client.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization || !organization.stripeAccountId) {
      throw new BadRequestException('Organization not connected to Stripe');
    }

    // ================================
    // Platform Fee
    // ================================

    const feePercent = Number(process.env.PLATFORM_FEE_PERCENT) || 10;

    const platformFee = amount * (feePercent / 100);

    // ================================
    // Create Payment Intent
    // ================================

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      application_fee_amount: platformFee,
      transfer_data: {
        destination: organization.stripeAccountId,
      },
    });

    // ================================
    // Store Payment
    // ================================

    await this.prisma.client.payment.create({
      data: {
        organizationId: organizationId,
        stripePaymentIntentId: paymentIntent.id,
        amount: amount,
        currency: 'usd',
        status: 'PENDING',
        platformFee: platformFee,
      },
    });

    if (!paymentIntent.client_secret) {
      throw new BadRequestException('Payment intent missing client secret');
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }
}
