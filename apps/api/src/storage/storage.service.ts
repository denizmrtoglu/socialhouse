import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { PresignedUrlDto } from './dto/presigned-url.dto';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    this.region = process.env.AWS_REGION ?? 'eu-central-1';
    this.bucket = process.env.AWS_S3_BUCKET ?? '';

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      },
    });
  }

  async getPresignedUrl(
    dto: PresignedUrlDto,
    userId: string,
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    const key = this.buildKey(dto, userId);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: this.getContentType(dto.extension),
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 300, // 5 minutes
    });

    const fileUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

    return { uploadUrl, fileUrl };
  }

  private buildKey(dto: PresignedUrlDto, userId: string): string {
    const ext = dto.extension.replace(/^\./, '');

    if (dto.type === 'profile') {
      return `users/${userId}/profile.${ext}`;
    }

    if (dto.type === 'event-cover') {
      if (!dto.eventId) {
        throw new BadRequestException(
          'eventId is required for event-cover uploads',
        );
      }
      return `events/${dto.eventId}/cover.${ext}`;
    }

    throw new BadRequestException('Invalid upload type');
  }

  private getContentType(extension: string): string {
    const ext = extension.replace(/^\./, '').toLowerCase();
    const map: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      heic: 'image/heic',
    };
    return map[ext] ?? 'application/octet-stream';
  }
}
