import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Refresh;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
      //check this once
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: any): Promise<Partial<User>> {
    const refreshToken = request?.cookies?.Refresh;
    const isValid = await this.userService.ISCookieValid(
      payload.sub,
      refreshToken,
    );

    if (!isValid) throw new UnauthorizedException();
    return {
      id: payload.sub,
      email: payload.email,
      isEmailConfirmed: payload.isEmailConfirmed,
    };
  }
}
