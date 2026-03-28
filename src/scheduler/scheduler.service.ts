import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Scheduler } from './entities/scheduler.entity';
import { TelegramService } from './telegram.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SystemService } from '../system/system.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(Scheduler)
    private schedulerRepository: Repository<Scheduler>,
    private telegramService: TelegramService,
    private systemService: SystemService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const isEnabled = await this.systemService.getSetting('is_cron_enabled');
    if (isEnabled !== 'true') {
      return;
    }

    this.logger.debug('Checking for due schedules');
    const now = new Date();
    
    // Find pending items that are due
    const items = await this.schedulerRepository.find({
      where: {
        status: 'pending',
        scheduledAt: LessThanOrEqual(now),
      },
    });

    if (items.length === 0) return;

    this.logger.log(`Found ${items.length} due items to notify`);

    for (const item of items) {
      try {
        const message = `<b>🔔 Thông báo lịch hẹn:</b>\n\n` +
                        `<b>Tiêu đề:</b> ${item.title}\n` +
                        `<b>Nội dung:</b> ${item.description || 'Không có mô tả'}\n` +
                        `<b>Thời gian:</b> ${item.scheduledAt.toLocaleString('vi-VN')}`;
        
        await this.telegramService.sendMessage(message);

        // Update status to done
        item.status = 'done';
        await this.schedulerRepository.save(item);
        this.logger.log(`Notification sent for item #${item.id}`);
      } catch (error) {
        this.logger.error(`Failed to process item #${item.id}: ${error.message}`);
      }
    }
  }

  async findAll(): Promise<Scheduler[]> {
    return this.schedulerRepository.find({ order: { scheduledAt: 'ASC' } });
  }

  async findOne(id: number): Promise<Scheduler> {
    const item = await this.schedulerRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Scheduler #${id} not found`);
    }
    return item;
  }

  async create(data: Partial<Scheduler>): Promise<Scheduler> {
    const item = this.schedulerRepository.create(data);
    return this.schedulerRepository.save(item);
  }

  async update(id: number, data: Partial<Scheduler>): Promise<Scheduler> {
    await this.findOne(id);
    await this.schedulerRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.schedulerRepository.delete(id);
  }
}
