import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { Post } from '../posts/entities/post.entity';
import { Category } from '../categories/entities/category.entity';
import { Menu } from '../menus/entities/menu.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SystemSetting, Post, Category, Menu])],
  providers: [SystemService],
  controllers: [SystemController],
  exports: [SystemService],
})
export class SystemModule {}
