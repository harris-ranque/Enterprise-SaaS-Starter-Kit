import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';
import type { File as StoredFile, Payment } from '@prisma/client';
import type { AppConfig } from '../config/configuration';
import { createPrismaPgAdapter } from './create-prisma-adapter';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly client: PrismaClient;

  constructor(config: ConfigService<AppConfig, true>) {
    this.client = new PrismaClient({
      adapter: createPrismaPgAdapter(
        config.get('databaseUrl', { infer: true }),
      ),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }

  findPaymentByStripePaymentIntentId(
    stripePaymentIntentId: string,
  ): Promise<Payment | null> {
    return this.client.payment.findUnique({
      where: { stripePaymentIntentId },
    });
  }

  updatePaymentStatus(id: string, status: string): Promise<{ id: string }> {
    return this.client.payment.update({
      where: { id },
      data: { status },
      select: { id: true },
    });
  }

  createFile(data: Prisma.FileUncheckedCreateInput): Promise<StoredFile> {
    return this.client.file.create({ data });
  }
}
