import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { Scheduler } from './entities/scheduler.entity';

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get()
  findAll() {
    return this.schedulerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schedulerService.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<Scheduler>) {
    return this.schedulerService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Scheduler>,
  ) {
    return this.schedulerService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schedulerService.remove(id);
  }
}
