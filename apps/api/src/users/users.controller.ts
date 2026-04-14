import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { GetAuth } from '../auth/get-auth.decorator';
import type { ClerkAuthUser } from '../auth/auth.guard';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import type { UpdatePushTokenDto } from './dto/update-push-token.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@GetAuth() auth: ClerkAuthUser) {
    return this.usersService.getMe(auth.clerkId);
  }

  @Patch('me')
  updateProfile(@Body() dto: UpdateProfileDto, @GetAuth() auth: ClerkAuthUser) {
    return this.usersService.updateProfile(auth.clerkId, dto);
  }

  @Patch('me/push-token')
  updatePushToken(
    @Body() dto: UpdatePushTokenDto,
    @GetAuth() auth: ClerkAuthUser,
  ) {
    return this.usersService.updatePushToken(auth.clerkId, dto);
  }
}
