import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Gender } from 'src/user/user.entity';

export class UserView {
  id: string;
  email: string;
}

// this is defined for swagger
export class SingUpReturnType {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'name', description: 'it could be null' })
  name: null | string;

  @ApiProperty({
    example: 'male|female|other',
    description: 'Default value is other',
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 'lastName', description: 'it could be null' })
  @IsString()
  @IsOptional()
  lastName: null | string;

  @ApiProperty({ description: 'it could be null' })
  @IsString()
  @IsOptional()
  avatarId: null | string;

  @ApiProperty({ description: 'id' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'false', description: 'default false ' })
  @IsBoolean()
  isRegisteredWithGoogle: boolean;
}

export class LoginDto {
  @IsString()
  @ApiProperty({ example: 'test@test.com' })
  email: string;

  @IsEmail()
  @ApiProperty({ example: 'string' })
  password: string;
}
