import {
  ClassSerializerInterceptor,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UseInterceptors,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { User } from './user.entity';
import {
  CreateUserDto,
  createUserWithGmail,
} from '../common/dtos/CreateUser.dto';
import * as bcrypt from 'bcrypt';
import { PostgresErrorCode } from 'src/common/postgres_error_code/postgresErrorCode';
import { UserView } from 'src/auth/types';

import AvatarLocalService from 'src/avatar/avatarLocal.service';
import { AvatarLocal } from 'src/avatar/entity/AvatarLocal.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => AvatarLocalService))
    private readonly avatarLocalService: AvatarLocalService,
  ) {}

  async findOne(
    email: string,
    relations?: Record<string, boolean>,
  ): Promise<User | null> {
    let result;

    if (!relations) {
      result = await this.userRepository.findOne({
        where: { email },
      });
    } else {
      result = await this.userRepository.findOne({
        where: { email },
        relations,
      });
    }

    return result ? result : null;
  }

  async createUser(user: CreateUserDto) {
    try {
      const newUser = this.userRepository.create(user);

      await this.userRepository.save(newUser);
      return newUser;
    } catch (err) {
      if (err?.code === PostgresErrorCode.UniqueViolation)
        throw new ConflictException('user with the same email exist!');
      throw new InternalServerErrorException();
    }
  }

  async createUserWithGmail(user: createUserWithGmail) {
    try {
      const newUser = this.userRepository.create(user);

      await this.userRepository.save(newUser);

      return newUser;
    } catch (err) {
      if (err?.code === PostgresErrorCode.UniqueViolation)
        throw new ConflictException(
          'user with the same username or email exist',
        );
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async setRefreshToken(id: string, refresh: string) {
    const saltOrRounds = 10;

    const hashedRefresh = await bcrypt.hash(refresh, saltOrRounds);

    const updated = await this.userRepository.update({ id }, { hashedRefresh });
  }

  async ISCookieValid(id: string, reqRefreshToken: string): Promise<Boolean> {
    const user = await this.userRepository.findOne({ where: { id } });

    const saltOrRounds = 10;
    const hash = await bcrypt.hash(reqRefreshToken, saltOrRounds);

    const isMatch = await bcrypt.compare(reqRefreshToken, user.hashedRefresh);

    return isMatch;
  }

  async removeRefreshToken(user: UserView) {
    return this.userRepository.update(
      { id: user.id },
      {
        hashedRefresh: null,
      },
    );
  }

  async updateUser(
    id: string,
    updateQuery: Partial<User>,
  ): Promise<UpdateResult> {
    const updated = await this.userRepository.update(id, updateQuery);

    return updated;
  }

  async addAvatarLocalToUser(user: Partial<User>, avatarLocal: AvatarLocal) {
    const foundUser = await this.findOne(user.email);
    foundUser.AvatarLocal = avatarLocal;
    return this.userRepository.save(foundUser);
  }
}
