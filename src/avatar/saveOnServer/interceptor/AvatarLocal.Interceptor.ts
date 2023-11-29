import { Injectable, NestInterceptor, mixin } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
interface AvatarLocalsInterceptorOptions {
  fieldName: string;
  path?: string;
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

      this.fileInterceptor = new (FileInterceptor(options.fieldName, {
        storage,
      }))();
    }

    intercept(...args: Parameters<NestInterceptor['intercept']>) {
      return this.fileInterceptor.intercept(...args);
    }
  }
  return mixin(CustomFileInterceptor);
}
