import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';

@Injectable()
export class SystemService implements OnModuleInit {
  constructor(
    @InjectRepository(SystemSetting)
    private settingsRepository: Repository<SystemSetting>,
  ) {}

  async onModuleInit() {
    // Initialize default settings if they don't exist
    await this.ensureSetting('is_cron_enabled', 'true');
  }

  private async ensureSetting(key: string, defaultValue: string) {
    const exists = await this.settingsRepository.findOne({ where: { key } });
    if (!exists) {
      await this.settingsRepository.save({ key, value: defaultValue });
    }
  }

  async getSetting(key: string): Promise<string | null> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await this.settingsRepository.save({ key, value });
  }

  async findAll(): Promise<SystemSetting[]> {
    return this.settingsRepository.find();
  }
}
