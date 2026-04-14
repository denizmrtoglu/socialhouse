import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { OffersService } from './offers.service';
import { AuthGuard } from '../auth/auth.guard';
import { GetAuth } from '../auth/get-auth.decorator';
import type { ClerkAuthUser } from '../auth/auth.guard';
import type { CreateOfferDto } from './dto/create-offer.dto';

@Controller('offers')
@UseGuards(AuthGuard)
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Body() dto: CreateOfferDto, @GetAuth() auth: ClerkAuthUser) {
    return this.offersService.create(auth.clerkId, dto);
  }

  @Get('me')
  findMine(@GetAuth() auth: ClerkAuthUser) {
    return this.offersService.findMyOffers(auth.clerkId);
  }
}
