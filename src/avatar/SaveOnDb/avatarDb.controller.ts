import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AvatarService } from './avatarDb.service';
import { UserService } from 'src/user/user.service';
import { UserView } from 'src/auth/types';
import { UserDec } from 'src/common/decorator/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Readable } from 'typeorm/platform/PlatformTools';

@Controller('avatarOnDb')
export class AvatarController {
  constructor(
    private readonly avatarService: AvatarService,
    private readonly userService: UserService,
  ) {}

  // Start of region for handling Avatar data inside the database
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @Post('addAvatarToDataBase')
  async addAvatar(
    @UserDec() user: UserView,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    const avatar = await this.avatarService.addAvatarToDataBase(
      user,
      file.originalname,
      file.buffer,
    );

    await this.userService.updateUser(user.id, { avatarId: avatar.id });

    return avatar;
  }

  @Get(':avatarIdInDataBase')
  async getAvatar(
    @Param('avatarIdInDataBase') avatarId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<any> {
    const avatar = await this.avatarService.getAvatarFromDataBase(avatarId);

    const stream = Readable.from(avatar.data);

    response.set({
      'Content-Disposition': `inline; filename="${avatar.fileName}"`,
      'Content-Type': 'image',
    });

    return new StreamableFile(stream);
  }

  // end of region
}
