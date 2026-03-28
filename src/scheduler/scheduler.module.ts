import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Scheduler } from './entities/scheduler.entity';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';
import { TelegramService } from './telegram.service';

@Module({
  imports: [TypeOrmModule.forFeature([Scheduler]), ConfigModule],
  controllers: [SchedulerController],
  providers: [SchedulerService, TelegramService],
})
export class SchedulerModule {}
