import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { AuthGuard } from '../auth/auth.guard';
import { GetAuth } from '../auth/get-auth.decorator';
import type { ClerkAuthUser } from '../auth/auth.guard';
import type { CreateApplicationDto } from './dto/create-application.dto';

@Controller('applications')
@UseGuards(AuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Body() dto: CreateApplicationDto, @GetAuth() auth: ClerkAuthUser) {
    return this.applicationsService.create(auth.clerkId, dto);
  }

  @Get('me')
  findMine(@GetAuth() auth: ClerkAuthUser) {
    return this.applicationsService.findMyApplications(auth.clerkId);
  }
}
