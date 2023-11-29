import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GaxiosResponse } from 'gaxios';
import { google, Auth, oauth2_v2 } from 'googleapis';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { Gender } from 'src/user/user.entity';

interface authenticateReturnInterface {
  accessTokenCookie: string;
  refreshTokenCookie: string;
  user: User;
}

@Injectable()
export class GoogleAuthenticationService {
  oAuthClient: Auth.OAuth2Client;
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    const clientSecrete = this.configService.get('GOOGLE_AUTH_CLIENT_SECRET');
    const clientId = this.configService.get('GOOGLE_AUTH_CLIENT_ID');
    const redirectUrl = this.configService.get('GOOGLE_REDIRECT');
    this.oAuthClient = new google.auth.OAuth2(
      clientId,
      clientSecrete,
      redirectUrl,
    );
  }

  async register(userInfo: GaxiosResponse<oauth2_v2.Schema$Userinfo>) {
    const { email, family_name, gender, name } = userInfo.data;

    let enumGender: Gender;
    switch (gender) {
      case 'male': {
        enumGender = Gender.MALE;
        break;
      }
      case 'female': {
        enumGender = Gender.FEMALE;
        break;
      }
      default: {
        enumGender = Gender.OTHER;
      }
    }
    const newUser = await this.userService.createUserWithGmail({
      name,
      email,
      lastName: family_name,
      gender: enumGender,
      isEmailConfirmed: true,
      isRegisteredWithGoogle: true,
    });

    return newUser;
  }

  async authenticate(code: string): Promise<authenticateReturnInterface> {
    const userInfo = await this.decode(code);

    let user = await this.userService.findOne(userInfo.data.email);

    if (!user) {
      user = await this.register(userInfo);
    }
    const refreshTokenCookie = this.authService.getRefreshToken(user);

    const accessTokenCookie = this.authService.getAccessToken(user);

    await this.userService.setRefreshToken(
      user.id,
      refreshTokenCookie.split(';')[0].split('=')[1],
    );

    return { accessTokenCookie, refreshTokenCookie, user };
  }

  async decode(
    code: string,
  ): Promise<GaxiosResponse<oauth2_v2.Schema$Userinfo>> {
    try {
      const { tokens } = await this.oAuthClient.getToken(code);

      const tokenInfo = await this.oAuthClient.getTokenInfo(
        tokens.access_token,
      );

      this.oAuthClient.setCredentials(tokens);

      const oauth2 = google.oauth2({
        version: 'v2',
        auth: this.oAuthClient,
      });

      const userInfo = await oauth2.userinfo.get();
      return userInfo;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}
