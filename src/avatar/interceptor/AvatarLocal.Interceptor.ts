import {
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  mixin,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
interface AvatarLocalsInterceptorOptions {
  fieldName: string;
  path?: string;
  fileFilter?: MulterOptions['fileFilter'];
  limits?: MulterOptions['limits'];
}

export function AvatarLocalInterceptor(
  options: AvatarLocalsInterceptorOptions,
) {
  @Injectable()
  class CustomFileInterceptor implements NestInterceptor {
    fileInterceptor: NestInterceptor;
    constructor(readonly configService: ConfigService) {
      const fileDestination =
        configService.get('UPLOAD_DESTINATION') + options.path;

      const storage = diskStorage({
        destination: function (req, file, cb) {
          cb(null, fileDestination);
        },
        filename: function (req, file, cb) {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + '-' + uniqueSuffix);
        },
      });

      const multerOptions: MulterOptions = {
        storage,
        fileFilter: options.fileFilter,
        limits: options.limits,
      };

      this.fileInterceptor = new (FileInterceptor(
        options.fieldName,
        multerOptions,
      ))();
    }

    intercept(context: ExecutionContext, next: CallHandler) {
      const user = context.switchToHttp().getRequest().user;
      if (user.AvatarLocal)
        throw new ConflictException('You already have an avatar!');

      return this.fileInterceptor.intercept(context, next);
    }
  }
  return mixin(CustomFileInterceptor);
}
