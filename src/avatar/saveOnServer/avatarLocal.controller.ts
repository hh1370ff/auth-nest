import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Inject,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  forwardRef,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { UserView } from 'src/auth/types';
import { UserDec } from 'src/common/decorator/public.decorator';
import { AvatarLocalInterceptor } from './interceptor/AvatarLocal.Interceptor';
import { User } from 'src/user/user.entity';
import AvatarLocalService from './avatarLocal.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Avatar')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('avatarOnServer')
export class AvatarController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly avatarLocalService: AvatarLocalService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  // Start of region for handling Avatar data in server

  // end of region
  @Post('avatarToServer')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    AvatarLocalInterceptor({
      fieldName: 'file',
      path: '/avatars',
    }),
  )
  async avatarToServer(
    @UserDec() user: UserView,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarLocal = await this.avatarLocalService.createAvatarLocalData({
      path: file.path,
      filename: file.originalname,
      mimetype: file.mimetype,
    });

    return this.userService.addAvatarLocalToUser(user, avatarLocal);
  }

  @Delete('deleteAvatarFromServer')
  @UseGuards(AuthGuard('jwt'))
  async deleteAvatarFromServer(@UserDec() user: Partial<User>) {
    this.avatarLocalService.deleteAvatarFromServer(user);
  }
}
