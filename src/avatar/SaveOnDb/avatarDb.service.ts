import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Avatar } from './entity/avatar.entity';
import { UserView } from 'src/auth/types';
import { DataSource } from 'typeorm';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AvatarService {
  constructor(
    @InjectRepository(Avatar)
    private readonly avatarRepository: Repository<Avatar>,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
  ) {}

  async addAvatarToDataBase(user: UserView, fileName: string, data: Buffer) {
    // create a query runner
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    queryRunner.startTransaction();

    // find the Avatar id if exist
    try {
      const foundUser = await queryRunner.manager.findOne(User, {
        where: { id: user.id },
      });

      const newAvatar = await this.setAvatarWithQueryRunnerInDataBase(
        data,
        fileName,
        queryRunner,
      );
      await queryRunner.manager.update(User, foundUser.id, {
        avatarId: newAvatar.id,
      });

      const currentAvatarId = foundUser?.avatarId;

      if (currentAvatarId)
        await this.deleteAvatarWithQueryRunnerFromDataBase(
          currentAvatarId,
          queryRunner,
        );
      await queryRunner.commitTransaction();
      return newAvatar;
    } catch (err) {
      queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      queryRunner.release();
    }
  }

  async getAvatarFromDataBase(avatarId: string): Promise<Avatar> {
    const file = await this.avatarRepository.findOne({
      where: { id: avatarId },
    });
    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }

  async setAvatarWithQueryRunnerInDataBase(
    data: Buffer,
    fileName: string,
    queryRunner: QueryRunner,
  ): Promise<Avatar> {
    const newFile = queryRunner.manager.create(Avatar, { data, fileName });

    await queryRunner.manager.save(Avatar, newFile);

    return newFile;
  }

  async deleteAvatarWithQueryRunnerFromDataBase(
    avatarId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    try {
      const { affected } = await queryRunner.manager.delete(Avatar, avatarId);
      if (!affected) throw new NotFoundException();
    } catch (err) {
      console.log(err);
    }
  }
}
