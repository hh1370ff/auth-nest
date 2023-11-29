import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/common/dtos/CreateUser.dto';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { UserDec } from 'src/common/decorator/public.decorator';
import { LoginDto, SingUpReturnType, UserView } from './types';
import { Response } from 'express';
import { EmailConfirmationService } from 'src/email-confirmation/email-confirmation.service';
import { User } from 'src/user/user.entity';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';

@ApiTags('Auth')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  // region Public Endpoints

  @ApiResponse({
    status: 409,
    description: 'User with the same credential exist!',
  })
  @ApiResponse({
    status: 400,
    description: 'Email must be an email!',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: SingUpReturnType,
  })
  @ApiOperation({
    summary: 'sign up new user',
    description:
      'Triggering this rout with valid email and a password register new users into the database.',
  })
  @Post('singUp')
  async singUp(@Body() user: CreateUserDto) {
    // Implementation for POST /auth/singUp

    const createdUser = await this.authService.signUp(user);

    // second send verification link

    await this.emailConfirmationService.sendVerificationLink(user.email);
    return createdUser;
  }

  @ApiBody({
    description: 'Login credentials',
    type: LoginDto,
  })
  @ApiOperation({
    summary: 'Log in and set authentication cookies',
    description:
      'Sets cookies for both access and refresh tokens (Authentication and Refresh). Cookies are included in the response headers as "Set-Cookie".',
  })
  @ApiResponse({ status: 401, description: 'Invalid Credentials' })
  @ApiResponse({ status: 400, description: 'Email is not confirmed' })
  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(
    @UserDec() user: Partial<User>,
    @Res() res: Response,
  ): Promise<void> {
    // Implementation for POST /auth/login
    const accessTokenCookie = this.authService.getAccessToken(user);
    const refreshTokenCookie = this.authService.getRefreshToken(user);

    // save Refresh hash in db (ugly code for receiving the refresh token from the cookie)
    const refresh_token = refreshTokenCookie.split(';')[0].split('=')[1];
    await this.userService.setRefreshToken(user.id, refresh_token);

    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    res.sendStatus(200);
  }

  // end region

  // region Private Methods

  @ApiOperation({
    summary: 'Logout and clear authentication cookies',
    description:
      'Clear cookies for both access and refresh tokens (Authentication and Refresh).',
  })
  @HttpCode(204)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@UserDec() user: UserView, @Res() res: Response) {
    // Implementation for POST /auth/logout
    const cookie = this.authService.getCookiesForLogOut();
    await this.userService.removeRefreshToken(user);

    res.setHeader('Set-cookie', cookie);
    return res.sendStatus(204);
  }

  @ApiOperation({
    summary: 'refresh your access token',
    description:
      'Calling this rout with valid refresh token set a new access token in your cookie',
  })
  @ApiResponse({ status: 401, description: 'unauthorized' })
  @ApiResponse({ status: 200, description: 'you will a new access token' })
  @Get('refresh')
  @UseGuards(AuthGuard('jwt-refresh-token'))
  refresh(@UserDec() user: Partial<User>, @Res() res: Response) {
    // Implementation for POST /auth/logout
    const accessTokenCookie = this.authService.getAccessToken(user);
    res.setHeader('Set-cookie', accessTokenCookie);
    return res.sendStatus(200);
  }

  // end region
}
