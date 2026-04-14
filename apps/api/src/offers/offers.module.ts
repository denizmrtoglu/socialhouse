import { Module } from '@nestjs/common';
import { OffersController } from './offers.controller';
import { AdminOffersController } from './admin-offers.controller';
import { OffersService } from './offers.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [OffersController, AdminOffersController],
  providers: [OffersService],
})
export class OffersModule {}
