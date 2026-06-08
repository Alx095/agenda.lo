import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import type { SafeUser } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';

@Controller('businesses')
@UseGuards(JwtAuthGuard)
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  create(
    @CurrentUser() user: SafeUser,
    @Body() createBusinessDto: CreateBusinessDto,
  ) {
    return this.businessesService.create(user.id, createBusinessDto);
  }

  @Get()
  findAll(@CurrentUser() user: SafeUser) {
    return this.businessesService.findAllForUser(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: SafeUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.businessesService.findOneForUser(user.id, id);
  }
}
