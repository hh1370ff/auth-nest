import { Module, forwardRef } from '@nestjs/common';
import { AvatarController } from './avatarLocal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../../user/user.module';
import { ConfigModule } from '@nestjs/config';
import AvatarLocalService from './avatarLocal.service';
import { AvatarLocal } from './entity/AvatarLocal.entity';
import { User } from 'src/user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AvatarLocal, User]),
    forwardRef(() => UserModule),
    ConfigModule,
  ],
  controllers: [AvatarController],
  providers: [AvatarLocalService],
  exports: [AvatarLocalService],
})
export class AvatarLocalModule {}
