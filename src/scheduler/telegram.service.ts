import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly chatId: string;

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID') || '';
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.botToken || !this.chatId) {
      this.logger.error('Telegram Bot Token or Chat ID is not configured');
      return;
    }

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    try {
      await axios.post(url, {
        chat_id: this.chatId,
        text,
        parse_mode: 'HTML',
      });
      this.logger.log('Telegram message sent successfully');
    } catch (error) {
      this.logger.error(`Failed to send Telegram message: ${error.message}`);
      if (error.response) {
        this.logger.error(`Telegram API error: ${JSON.stringify(error.response.data)}`);
      }
    }
  }
}
