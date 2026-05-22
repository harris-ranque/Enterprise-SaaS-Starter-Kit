import { Processor, WorkerHost } from '@nestjs/bullmq';

import { Job } from 'bullmq';

export type WelcomeEmailJobData = {
  email: string;
  name?: string;
};

@Processor('email')
export class EmailProcessor extends WorkerHost {
  async process(job: Job<WelcomeEmailJobData>) {
    switch (job.name) {
      case 'send-welcome-email':
        await this.handleWelcomeEmail(job.data);

        break;

      default:
        console.log(`Unknown job: ${job.name}`);
    }
  }

  // =====================================
  // HANDLE WELCOME EMAIL
  // =====================================
  async handleWelcomeEmail(data: WelcomeEmailJobData) {
    console.log(`Sending welcome email to ${data.email}`);

    // =====================================
    // FUTURE:
    // SENDGRID / RESEND / SES
    // =====================================

    // simulate async work
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(`Welcome email sent to ${data.email}`);
  }
}
