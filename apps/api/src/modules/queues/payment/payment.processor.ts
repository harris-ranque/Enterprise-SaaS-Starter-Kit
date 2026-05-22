import { Processor, WorkerHost } from '@nestjs/bullmq';

import { Job } from 'bullmq';

@Processor('payment')
export class PaymentProcessor extends WorkerHost {
  process(job: Job): Promise<void> {
    switch (job.name) {
      case 'payment-success':
        this.handlePaymentSuccess(job.data);

        break;

      default:
        console.log(`Unknown payment job`);
    }

    return Promise.resolve();
  }

  handlePaymentSuccess(data: unknown) {
    console.log('Processing successful payment', data);

    // future:
    // analytics
    // invoice generation
    // notifications
    // audit logs
    // subscription activation
  }
}
