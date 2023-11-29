import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AvatarLocalModule } from 'src/avatar/saveOnServer/avatarLocal.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AvatarLocalModule),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
