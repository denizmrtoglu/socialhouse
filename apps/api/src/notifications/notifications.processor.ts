import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import Expo from 'expo-server-sdk';
import { NOTIFICATIONS_QUEUE } from '../queue/queue.module';
import type { SendPushJobData } from '../applications/applications.service';

@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);
  private readonly expo = new Expo();

  async process(job: Job<SendPushJobData>): Promise<void> {
    const { expoPushToken, title, body } = job.data;

    if (!Expo.isExpoPushToken(expoPushToken)) {
      this.logger.warn(`Invalid Expo push token: ${expoPushToken}`);
      return;
    }

    try {
      const [ticket] = await this.expo.sendPushNotificationsAsync([
        { to: expoPushToken, title, body, sound: 'default' },
      ]);

      if (ticket.status === 'error') {
        this.logger.error(`Push failed: ${ticket.message}`);
      } else {
        this.logger.log(`Push sent — token: ${expoPushToken.slice(0, 20)}...`);
      }
    } catch (err) {
      this.logger.error(`Push error: ${(err as Error).message}`);
      throw err; // BullMQ retry
    }
  }
}
