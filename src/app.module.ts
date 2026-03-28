import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { MediaModule } from './media/media.module';
import { Media } from './media/entities/media.entity';
import { SchedulerModule } from './scheduler/scheduler.module';
import { Scheduler } from './scheduler/entities/scheduler.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { SystemModule } from './system/system.module';
import { SystemSetting } from './system/entities/system-setting.entity';
import { PostsModule } from './posts/posts.module';
import { Post } from './posts/entities/post.entity';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './categories/entities/category.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, Media, Scheduler, SystemSetting, Post, Category],
        synchronize: true,
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    UsersModule,
    AuthModule,
    MediaModule,
    SchedulerModule,
    SystemModule,
    PostsModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
