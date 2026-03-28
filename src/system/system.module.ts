import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SystemSetting])],
  providers: [SystemService],
  controllers: [SystemController],
  exports: [SystemService],
})
export class SystemModule {}
