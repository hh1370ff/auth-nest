import {
  BadRequestException,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Res,
  StreamableFile,
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
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Response } from 'express';
import { FileUploadDto } from './swaggerStuffs';

@ApiTags('Avatar')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('avatar')
export class AvatarController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly avatarLocalService: AvatarLocalService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  @ApiResponse({
    status: 413,
    description: 'File size must be lest than 1MB',
  })
  @ApiResponse({ status: 400, description: 'Not a valid image' })
  @ApiResponse({ status: 401, description: 'unAuthorize' })
  @ApiResponse({ status: 409, description: 'You already have an avatar' })
  @ApiOperation({
    summary: 'add an avatar for the user',
    description:
      'if the user has a valid access token and does not have an avatar, using this rout user can add an avatar to his account',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Pick your Avatar it should be lest than 1 MB',
    type: FileUploadDto,
  })
  @Post()
  @UseInterceptors(
    AvatarLocalInterceptor({
      fieldName: 'file',
      path: '/avatars',
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(new BadRequestException('Not a valid image'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: Math.pow(1024, 2), // 1MB
      },
    }),
  )
  @UseGuards(AuthGuard('jwt'))
  async avatarToServer(
    @UserDec() user: UserView,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarLocal = await this.avatarLocalService.createAvatarLocalData({
      path: file.path,
      filename: file.originalname,
      mimetype: file.mimetype,
    });
    const updatedUser = this.userService.addAvatarLocalToUser(
      user,
      avatarLocal,
    );

    return avatarLocal;
  }

  @ApiResponse({ status: 200, description: 'You will receive an Avatar' })
  @ApiResponse({ status: 400, description: 'You do not have an Avatar' })
  @ApiResponse({ status: 401, description: 'unAuthorize' })
  @ApiOperation({
    summary: "get the current user's avatar",
    description:
      'if the user has a valid access token, the user can receive it avatar using this route',
  })
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getDatabaseFileById(
    @UserDec() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { AvatarLocal } = user;
    if (!AvatarLocal)
      throw new BadRequestException('You do not have an Avatar');
    process.cwd();
    const stream = createReadStream(join(process.cwd(), AvatarLocal.path));

    response.set({
      'Content-Disposition': `inline; filename="${AvatarLocal.filename}"`,
      'Content-Type': AvatarLocal.mimetype,
    });
    return new StreamableFile(stream);
  }

  @ApiResponse({ status: 401, description: 'unAuthorize' })
  @ApiResponse({ status: 400, description: 'You do not have an avatar' })
  @ApiResponse({ status: 202, description: 'success delete' })
  @ApiOperation({
    summary: "delete the current user's avatar",
    description:
      'if the user has a valid access token and has an avatar, the user can delete the avatar',
  })
  @Delete()
  @HttpCode(202)
  @UseGuards(AuthGuard('jwt'))
  async deleteAvatarFromServer(@UserDec() user: Partial<User>) {
    if (!user.AvatarLocal)
      throw new BadRequestException('You do not have an avatar');
    this.avatarLocalService.deleteAvatarFromServer(user);
  }
}
