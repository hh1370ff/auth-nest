import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/common/dtos/CreateUser.dto';
import { UserView } from './types';
import { User } from 'src/user/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(credential: string, password: string): Promise<Partial<User>> {
    const validUser = await this.authService.validateUser(credential, password);

    if (!validUser) throw new UnauthorizedException('Invalid Credentials');
    if (!validUser.isEmailConfirmed)
      throw new BadRequestException('Email is not confirmed');

    return validUser;
  }
}
