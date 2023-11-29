import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { GoogleAuthenticationService } from './google-authentication.service';
import { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';

@Controller('google-authentication')
export class GoogleAuthenticationController {
  constructor(
    private readonly googleAuthService: GoogleAuthenticationService,
    private readonly userService: UserService,
  ) {}

  @Post()
  verifyGoogleToken(@Req() req: Request) {
    console.log(req.body);
  }

  @Get('authenticateWithGoogle')
  async authenticate(@Req() req: Request, @Res() res: Response) {
    const { code } = req.query;

    const { accessTokenCookie, refreshTokenCookie, user } =
      await this.googleAuthService.authenticate(code as string);

    // set cookie
    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    res.send(user);
  }
}
