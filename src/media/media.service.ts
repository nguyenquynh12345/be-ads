import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Media } from './entities/media.entity';
import * as fs from 'fs';
import { join } from 'path';

import sharp from 'sharp';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  async findAll(filters?: { startDate?: string; endDate?: string; uploaderId?: number }): Promise<Media[]> {
    const where: any = {};

    if (filters?.uploaderId) {
      where.uploaderId = filters.uploaderId;
    }

    if (filters?.startDate && filters?.endDate) {
      where.createdAt = Between(new Date(filters.startDate), new Date(filters.endDate));
    } else if (filters?.startDate) {
      where.createdAt = MoreThanOrEqual(new Date(filters.startDate));
    } else if (filters?.endDate) {
      where.createdAt = LessThanOrEqual(new Date(filters.endDate));
    }

    const mediaList = await this.mediaRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['uploader'],
    });
    return mediaList.map(media => {
      if (media.uploader) {
        const { password, ...uploader } = media.uploader as any;
        return { ...media, uploader };
      }
      return media;
    });
  }

  async findOne(id: number): Promise<Media | null> {
    return this.mediaRepository.findOne({ where: { id } });
  }

  async create(mediaData: Partial<Media>): Promise<Media> {
    const media = this.mediaRepository.create(mediaData);
    return this.mediaRepository.save(media);
  }

  async generateThumbnail(filePath: string): Promise<string | null> {
    try {
      const ext = filePath.split('.').pop();
      const thumbPath = filePath.replace(`.${ext}`, `-thumb.${ext}`);

      await sharp(filePath)
        .resize(400)
        .toFile(thumbPath);

      return thumbPath;
    } catch (error) {
      console.error('Failed to generate thumbnail', error);
      return null;
    }
  }

  async remove(id: number): Promise<void> {
    const media = await this.findOne(id);
    if (media) {
      // Helper to delete physical file from URL
      const deleteFileFromUrl = (url: string) => {
        const urlParts = url.split('/uploads/');
        if (urlParts.length > 1) {
          const relativePath = urlParts[1];
          const filePath = join(process.cwd(), 'uploads', relativePath);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      };

      // Delete original
      deleteFileFromUrl(media.url);
      
      // Delete thumbnail if exists
      if (media.thumbnailUrl) {
        deleteFileFromUrl(media.thumbnailUrl);
      }

      await this.mediaRepository.delete(id);
    }
  }
}
