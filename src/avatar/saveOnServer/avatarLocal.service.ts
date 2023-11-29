import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvatarLocalDto } from './dto/AvatarLocalDto';
import { AvatarLocal } from './entity/AvatarLocal.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import * as fs from 'fs/promises';
import { DataSource } from 'typeorm';

@Injectable()
class AvatarLocalService {
  constructor(
    @InjectRepository(AvatarLocal)
    private readonly AvatarLocalsRepository: Repository<AvatarLocal>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  async createAvatarLocalData(fileData: AvatarLocalDto) {
    const newFile = this.AvatarLocalsRepository.create(fileData);
    await this.AvatarLocalsRepository.save(newFile);

    return newFile;
  }

  async deleteAvatarFromServer(user: Partial<User>) {
    const relation = { AvatarLocal: true };
    const userData = await this.userService.findOne(user.email, relation);

    if (userData && userData.AvatarLocal && userData.AvatarLocal.path) {
      const { path, id } = userData.AvatarLocal;
      const queryRunner = this.dataSource.createQueryRunner();
      await fs.unlink(path);
      try {
        await queryRunner.connect();
        await queryRunner.startTransaction();
        await queryRunner.manager.update(User, user.id, { AvatarLocal: null });
        await queryRunner.manager.delete(AvatarLocal, id);
        await queryRunner.commitTransaction();
      } catch (error) {
        console.error(error);
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
    }
  }
}

export default AvatarLocalService;
