import { Module } from '@nestjs/common';
import { AvatarController } from './avatarDb.controller';
import { AvatarService } from './avatarDb.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avatar } from './entity/avatar.entity';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Avatar]), UserModule, ConfigModule],
  controllers: [AvatarController],
  providers: [AvatarService],
})
export class AvatarToDbModule {}
