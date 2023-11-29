import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { Gender } from 'src/user/user.entity';
export class CreateUserDto {
  @ApiProperty({ type: 'email', example: 'test@test.com' })
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class createUserWithGmail {
  @IsEmail()
  email: string;

  @IsString()
  lastName: string;

  @IsString()
  name: string;

  @IsEnum(Gender, {
    message: 'Gender must be a valid value of the Gender enum.',
  })
  gender: Gender;

  @IsBoolean()
  isEmailConfirmed: boolean;

  @IsBoolean()
  isRegisteredWithGoogle: boolean;
}
