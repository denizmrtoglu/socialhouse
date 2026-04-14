import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { AuthGuard } from '../auth/auth.guard';
import { GetAuth } from '../auth/get-auth.decorator';
import type { ClerkAuthUser } from '../auth/auth.guard';
import type { PresignedUrlDto } from './dto/presigned-url.dto';

@Controller('storage')
@UseGuards(AuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presigned-url')
  async getPresignedUrl(
    @Body() dto: PresignedUrlDto,
    @GetAuth() auth: ClerkAuthUser,
  ) {
    return this.storageService.getPresignedUrl(dto, auth.clerkId);
  }
}
