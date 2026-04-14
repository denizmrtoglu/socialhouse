import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

export const NOTIFICATIONS_QUEUE = 'notifications';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
    BullModule.registerQueue({
      name: NOTIFICATIONS_QUEUE,
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
