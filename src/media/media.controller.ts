import { Controller, Get, Post, Delete, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  async findAll() {
    return this.mediaService.findAll();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const date = new Date().toISOString().split('T')[0];
          const uploadPath = `./uploads/${date}`;
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const date = new Date().toISOString().split('T')[0];
    const media = await this.mediaService.create({
      filename: file.filename,
      url: `http://localhost:3002/uploads/${date}/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
    });

    return media;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.mediaService.remove(+id);
  }
}
