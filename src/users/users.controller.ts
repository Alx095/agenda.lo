import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import type { SafeUser } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdatePushTokenDto } from './dto/update-push-token.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: SafeUser) {
    return this.usersService.getMe(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: SafeUser, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateMe(user.id, updateUserDto);
  }

  @Patch('me/push-token')
  updatePushToken(
    @CurrentUser() user: SafeUser,
    @Body() updatePushTokenDto: UpdatePushTokenDto,
  ) {
    return this.usersService.updatePushToken(
      user.id,
      updatePushTokenDto.pushToken,
    );
  }
}
