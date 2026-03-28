import { Controller, Get, Post, Delete, Param, UseInterceptors, UploadedFile, BadRequestException, Body, UseGuards, Query, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import axios from 'axios';
import * as mime from 'mime-types';
import { createWriteStream } from 'fs';
import { join } from 'path';

@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin', 'Editor')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('uploaderId') uploaderId?: string,
  ) {
    return this.mediaService.findAll({
      startDate,
      endDate,
      uploaderId: uploaderId ? +uploaderId : undefined,
    });
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
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
    @Body('name') name?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const date = new Date().toISOString().split('T')[0];
    
    // Generate thumbnail if image
    let thumbnailUrl: string | undefined;
    if (file.mimetype.startsWith('image/')) {
      const thumbPath = await this.mediaService.generateThumbnail(file.path);
      if (thumbPath) {
        const thumbFilename = thumbPath.split(/[\\/]/).pop();
        thumbnailUrl = `http://localhost:3002/uploads/${date}/${thumbFilename}`;
      }
    }

    const media = await this.mediaService.create({
      name: name?.trim() || file.originalname,
      filename: file.filename,
      url: `http://localhost:3002/uploads/${date}/${file.filename}`,
      thumbnailUrl,
      mimetype: file.mimetype,
      size: file.size,
      uploaderId: req.user.userId,
    });

    return media;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.mediaService.remove(+id);
  }

  @Post('download')
  async downloadFromUrl(
    @Body('url') url: string,
    @Req() req: any,
    @Body('name') name?: string,
  ) {
    if (!url) {
      throw new BadRequestException('URL is required');
    }

    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
      });

      const date = new Date().toISOString().split('T')[0];
      const uploadPath = `./uploads/${date}`;
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const contentType = response.headers['content-type'];
      const extension = mime.extension(contentType) || 'bin';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `${uniqueSuffix}.${extension}`;
      const filePath = join(uploadPath, filename);

      const writer = createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', async () => {
          try {
            const stats = fs.statSync(filePath);
            
            // Generate thumbnail if image
            let thumbnailUrl: string | undefined;
            if (contentType && contentType.startsWith('image/')) {
              const thumbPath = await this.mediaService.generateThumbnail(filePath);
              if (thumbPath) {
                const thumbFilename = thumbPath.split(/[\\/]/).pop();
                thumbnailUrl = `http://localhost:3002/uploads/${date}/${thumbFilename}`;
              }
            }

            const media = await this.mediaService.create({
              name: name?.trim() || url.split('/').pop() || 'downloaded-file',
              filename: filename,
              url: `http://localhost:3002/uploads/${date}/${filename}`,
              thumbnailUrl,
              mimetype: contentType || 'application/octet-stream',
              size: stats.size,
              uploaderId: req.user.userId,
            });
            resolve(media);
          } catch (e) {
            reject(e);
          }
        });
        writer.on('error', reject);
      });
    } catch (error) {
      throw new BadRequestException(`Failed to download file: ${error.message}`);
    }
  }
}
