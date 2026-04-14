import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ApplicationStatus, Gender } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NOTIFICATIONS_QUEUE } from '../queue/queue.module';
import type { CreateApplicationDto } from './dto/create-application.dto';
import type { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import type { BulkActionDto } from './dto/bulk-action.dto';

export interface SendPushJobData {
  expoPushToken: string;
  title: string;
  body: string;
}

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(NOTIFICATIONS_QUEUE) private readonly notificationsQueue: Queue,
  ) {}

  // ─── User endpoints ────────────────────────────────────────────────────────

  async create(clerkId: string, dto: CreateApplicationDto) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundException('User not found');

    // Profile must be complete
    if (!user.gender || !user.birthDate || !user.occupation) {
      throw new BadRequestException(
        'Profile incomplete. Fill in gender, birthDate and occupation before applying.',
      );
    }

    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });
    if (!event || !event.isActive) {
      throw new NotFoundException('Event not found or inactive');
    }

    // Check existing application
    const existing = await this.prisma.application.findUnique({
      where: { userId_eventId: { userId: user.id, eventId: dto.eventId } },
    });
    if (existing) {
      throw new ConflictException('Already applied to this event');
    }

    // Check guest limit
    const approvedCount = await this.prisma.application.count({
      where: { eventId: dto.eventId, status: ApplicationStatus.APPROVED },
    });
    if (approvedCount >= event.guestLimit) {
      throw new BadRequestException('Guest list is full');
    }

    // Determine initial status
    let status: ApplicationStatus = ApplicationStatus.PENDING;
    if (event.autoApproveAll) {
      status = ApplicationStatus.APPROVED;
    } else if (event.autoApproveFemale && user.gender === Gender.FEMALE) {
      status = ApplicationStatus.APPROVED;
    }

    const application = await this.prisma.application.create({
      data: { userId: user.id, eventId: dto.eventId, status },
      include: { event: true },
    });

    // Queue push notification if auto-approved
    if (status === ApplicationStatus.APPROVED) {
      await this.queueApprovalNotification(user.expoPushToken, event.title, ApplicationStatus.APPROVED);
    }

    return application;
  }

  async findMyApplications(clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.application.findMany({
      where: { userId: user.id },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Admin endpoints ────────────────────────────────────────────────────────

  findAll(eventId?: string) {
    return this.prisma.application.findMany({
      where: eventId ? { eventId } : undefined,
      include: { user: true, event: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateApplicationStatusDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { user: true, event: true },
    });
    if (!application) throw new NotFoundException('Application not found');

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: dto.status },
      include: { user: true, event: true },
    });

    await this.queueApprovalNotification(
      application.user.expoPushToken,
      application.event.title,
      dto.status,
    );

    return updated;
  }

  async bulkUpdateStatus(dto: BulkActionDto) {
    const applications = await this.prisma.application.findMany({
      where: { id: { in: dto.ids } },
      include: { user: true, event: true },
    });

    await this.prisma.application.updateMany({
      where: { id: { in: dto.ids } },
      data: { status: dto.status },
    });

    // Queue notifications for all
    await Promise.all(
      applications.map((app) =>
        this.queueApprovalNotification(
          app.user.expoPushToken,
          app.event.title,
          dto.status,
        ),
      ),
    );

    return { updated: dto.ids.length };
  }

  async exportToExcel(eventId: string) {
    const applications = await this.prisma.application.findMany({
      where: { eventId },
      include: { user: true, event: true },
      orderBy: { createdAt: 'asc' },
    });

    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.default.Workbook();
    const sheet = workbook.addWorksheet('Guest List');

    sheet.columns = [
      { header: 'Ad', key: 'firstName', width: 15 },
      { header: 'Soyad', key: 'lastName', width: 15 },
      { header: 'Cinsiyet', key: 'gender', width: 12 },
      { header: 'Yaş', key: 'age', width: 8 },
      { header: 'Meslek', key: 'occupation', width: 20 },
      { header: 'Instagram', key: 'instagram', width: 20 },
      { header: 'Başvuru Tarihi', key: 'createdAt', width: 18 },
      { header: 'Durum', key: 'status', width: 12 },
    ];

    for (const app of applications) {
      sheet.addRow({
        firstName: app.user.firstName,
        lastName: app.user.lastName,
        gender: app.user.gender ?? '-',
        age: app.user.birthDate ? this.calcAge(app.user.birthDate) : '-',
        occupation: app.user.occupation ?? '-',
        instagram: `@${app.user.instagram}`,
        createdAt: app.createdAt.toLocaleDateString('tr-TR'),
        status: app.status,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return { buffer, eventTitle: applications[0]?.event.title ?? eventId };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async queueApprovalNotification(
    expoPushToken: string | null,
    eventTitle: string,
    status: ApplicationStatus,
  ) {
    if (!expoPushToken) return;

    const isApproved = status === ApplicationStatus.APPROVED;
    const jobData: SendPushJobData = {
      expoPushToken,
      title: isApproved ? 'Harika haber! 🎉' : 'Üzgünüz 😔',
      body: isApproved
        ? `${eventTitle} için guest list başvurunuz onaylandı.`
        : `${eventTitle} için guest listemiz maalesef doldu. Bize ulaşmak için Instagram'dan DM atabilirsin.`,
    };

    await this.notificationsQueue.add('send-push', jobData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
    });
  }

  private calcAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }
}
