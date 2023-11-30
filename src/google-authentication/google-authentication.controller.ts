import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { GoogleAuthenticationService } from './google-authentication.service';
import { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';
import { ApiExcludeController, ApiOAuth2 } from '@nestjs/swagger';
var scopes = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

@ApiExcludeController()
@Controller('google-authentication')
export class GoogleAuthenticationController {
  constructor(
    private readonly googleAuthService: GoogleAuthenticationService,
    private readonly userService: UserService,
  ) {}

  @Get('authenticateWithGoogle')
  async authenticate(@Req() req: Request, @Res() res: Response) {
    const { code } = req.query;

    const { accessTokenCookie, refreshTokenCookie, user } =
      await this.googleAuthService.authenticate(code as string);

    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    res.send(user);
  }
}
