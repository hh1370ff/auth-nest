import {
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IsStrongPassword } from 'class-validator';
import { CreateUserDto } from 'src/common/dtos/CreateUser.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserView } from './types';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async validateUser(
    credential: string,
    claimedPassword: string,
  ): Promise<Partial<User>> {
    const foundUser = await this.userService.findOne(credential);

    if (!foundUser) return null;

    const isMatch = await bcrypt.compare(claimedPassword, foundUser.password);

    if (!isMatch) return null;

    return foundUser;
  }

  async signUp(user: CreateUserDto): Promise<User> {
    const { password, email } = user;

    //hash password
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);

    //create new user
    const newUser = await this.userService.createUser({
      email,
      password: hash,
    });

    return newUser;
  }

  getAccessToken(user: Partial<User>): string {
    const payload = {
      email: user.email,
      sub: user.id,
      isEmailConfirmed: user.isEmailConfirmed,
    };

    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: parseInt(
        this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      ),
    });

    return `Authentication=${access_token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    )}`;
  }

  getRefreshToken(user: Partial<User>): string {
    const payload = { email: user.email, sub: user.id };

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: parseInt(
        this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      ),
    });

    return `Refresh=${refresh_token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    )}`;
  }

  public getCookiesForLogOut() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }
}
