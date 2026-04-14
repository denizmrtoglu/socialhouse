import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import type { UpdatePushTokenDto } from './dto/update-push-token.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(clerkId: string, dto: UpdateProfileDto) {
    await this.getMe(clerkId);
    return this.prisma.user.update({
      where: { clerkId },
      data: {
        ...(dto.gender && { gender: dto.gender }),
        ...(dto.birthDate && { birthDate: new Date(dto.birthDate) }),
        ...(dto.occupation !== undefined && { occupation: dto.occupation }),
        ...(dto.profilePhoto !== undefined && { profilePhoto: dto.profilePhoto }),
      },
    });
  }

  async updatePushToken(clerkId: string, dto: UpdatePushTokenDto) {
    await this.getMe(clerkId);
    return this.prisma.user.update({
      where: { clerkId },
      data: { expoPushToken: dto.expoPushToken },
      select: { id: true, expoPushToken: true },
    });
  }

  // ─── Admin ──────────────────────────────────────────────────────────────────

  findAll(search?: string) {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { instagram: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { applications: { include: { event: true } }, offers: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
