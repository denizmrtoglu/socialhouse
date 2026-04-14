import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { StorageModule } from './storage/storage.module';
import { EventsModule } from './events/events.module';
import { QueueModule } from './queue/queue.module';
import { ApplicationsModule } from './applications/applications.module';
import { OffersModule } from './offers/offers.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    QueueModule,
    WebhooksModule,
    StorageModule,
    EventsModule,
    ApplicationsModule,
    OffersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
