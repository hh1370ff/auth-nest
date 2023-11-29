import { IsString } from 'class-validator';

export class AvatarLocalDto {
  @IsString()
  filename: string;
  @IsString()
  path: string;
  @IsString()
  mimetype: string;
}
