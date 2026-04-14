import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApplicationsService } from './applications.service';
import { AdminGuard } from '../auth/admin.guard';
import type { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import type { BulkActionDto } from './dto/bulk-action.dto';

@Controller('admin/applications')
@UseGuards(AdminGuard)
export class AdminApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  findAll(@Query('eventId') eventId?: string) {
    return this.applicationsService.findAll(eventId);
  }

  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(id, dto);
  }

  @Post('bulk')
  bulkUpdate(@Body() dto: BulkActionDto) {
    return this.applicationsService.bulkUpdateStatus(dto);
  }

  @Get('export/:eventId')
  async export(@Param('eventId') eventId: string, @Res() res: Response) {
    const { buffer, eventTitle } =
      await this.applicationsService.exportToExcel(eventId);

    const filename = `guest-list-${eventTitle.replace(/\s+/g, '-')}.xlsx`;
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    res.send(buffer);
  }
}
