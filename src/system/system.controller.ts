import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SystemService } from './system.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('system')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('settings')
  async findAll() {
    return this.systemService.findAll();
  }

  @Get('settings/:key')
  async findOne(@Param('key') key: string) {
    const value = await this.systemService.getSetting(key);
    return { key, value };
  }

  @Patch('settings/:key')
  async update(@Param('key') key: string, @Body('value') value: string) {
    await this.systemService.setSetting(key, value);
    return { key, value };
  }
}
