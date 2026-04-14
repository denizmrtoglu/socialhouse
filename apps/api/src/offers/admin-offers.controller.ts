import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { OffersService } from './offers.service';
import { AdminGuard } from '../auth/admin.guard';
import type { UpdateOfferDto } from './dto/update-offer.dto';

@Controller('admin/offers')
@UseGuards(AdminGuard)
export class AdminOffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  findAll() {
    return this.offersService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOfferDto) {
    return this.offersService.update(id, dto);
  }
}
