import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  async findAll(): Promise<Media[]> {
    return this.mediaRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Media | null> {
    return this.mediaRepository.findOne({ where: { id } });
  }

  async create(mediaData: Partial<Media>): Promise<Media> {
    const media = this.mediaRepository.create(mediaData);
    return this.mediaRepository.save(media);
  }

  async remove(id: number): Promise<void> {
    const media = await this.findOne(id);
    if (media) {
      // Extract relative path from URL: http://localhost:3002/uploads/2026-03-27/filename
      const urlParts = media.url.split('/uploads/');
      if (urlParts.length > 1) {
        const relativePath = urlParts[1];
        const filePath = join(process.cwd(), 'uploads', relativePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      await this.mediaRepository.delete(id);
    }
  }
}
