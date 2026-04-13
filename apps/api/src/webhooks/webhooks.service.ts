import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Webhook } from 'svix';
import { PrismaService } from '../prisma/prisma.service';

interface ClerkUserData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email_addresses: Array<{ id: string; email_address: string }>;
  primary_email_address_id: string;
  username: string | null;
}

interface ClerkWebhookEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: ClerkUserData;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handleClerkEvent(
    rawBody: Buffer,
    headers: Record<string, string>,
  ): Promise<{ received: boolean }> {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('CLERK_WEBHOOK_SECRET is not set');
    }

    let event: ClerkWebhookEvent;
    try {
      const wh = new Webhook(secret);
      event = wh.verify(rawBody.toString(), headers) as ClerkWebhookEvent;
    } catch {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    this.logger.log(`Clerk webhook received: ${event.type}`);

    switch (event.type) {
      case 'user.created':
        await this.handleUserCreated(event.data);
        break;
      case 'user.updated':
        await this.handleUserUpdated(event.data);
        break;
      case 'user.deleted':
        await this.handleUserDeleted(event.data);
        break;
      default:
        this.logger.warn(`Unhandled webhook event type: ${(event as any).type}`);
    }

    return { received: true };
  }

  private getPrimaryEmail(data: ClerkUserData): string {
    const primary = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id,
    );
    if (!primary) {
      throw new BadRequestException('No primary email found in Clerk payload');
    }
    return primary.email_address;
  }

  private async handleUserCreated(data: ClerkUserData): Promise<void> {
    const email = this.getPrimaryEmail(data);

    await this.prisma.user.create({
      data: {
        clerkId: data.id,
        firstName: data.first_name ?? '',
        lastName: data.last_name ?? '',
        instagram: data.username ?? '',
        email,
      },
    });

    this.logger.log(`User created: ${data.id}`);
  }

  private async handleUserUpdated(data: ClerkUserData): Promise<void> {
    const email = this.getPrimaryEmail(data);

    await this.prisma.user.update({
      where: { clerkId: data.id },
      data: {
        firstName: data.first_name ?? '',
        lastName: data.last_name ?? '',
        email,
      },
    });

    this.logger.log(`User updated: ${data.id}`);
  }

  private async handleUserDeleted(data: ClerkUserData): Promise<void> {
    await this.prisma.user.update({
      where: { clerkId: data.id },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`User soft-deleted: ${data.id}`);
  }
}
