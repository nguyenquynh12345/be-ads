import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Post()
  async create(@Body() user: Partial<User>) {
    return this.usersService.create(user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Partial<User>) {
    return this.usersService.update(+id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
