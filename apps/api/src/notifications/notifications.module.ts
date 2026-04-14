import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsProcessor } from './notifications.processor';
import { NOTIFICATIONS_QUEUE } from '../queue/queue.module';

@Module({
  imports: [BullModule.registerQueue({ name: NOTIFICATIONS_QUEUE })],
  providers: [NotificationsProcessor],
})
export class NotificationsModule {}
