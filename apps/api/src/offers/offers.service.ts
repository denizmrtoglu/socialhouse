import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateOfferDto } from './dto/create-offer.dto';
import type { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── User endpoints ────────────────────────────────────────────────────────

  async create(clerkId: string, dto: CreateOfferDto) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundException('User not found');

    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });
    if (!event || !event.isActive) {
      throw new NotFoundException('Event not found or inactive');
    }

    return this.prisma.offer.create({
      data: {
        userId: user.id,
        eventId: dto.eventId,
        type: dto.type,
        note: dto.note,
      },
      include: { event: true },
    });
  }

  async findMyOffers(clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.offer.findMany({
      where: { userId: user.id },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Admin endpoints ────────────────────────────────────────────────────────

  findAll() {
    return this.prisma.offer.findMany({
      include: { user: true, event: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateOfferDto) {
    const offer = await this.prisma.offer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException('Offer not found');

    return this.prisma.offer.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.adminNote !== undefined && { adminNote: dto.adminNote }),
      },
      include: { user: true, event: true },
    });
  }
}
