import { Exclude } from 'class-transformer';
import { Avatar } from 'src/avatar/SaveOnDb/entity/avatar.entity';
import { AvatarLocal } from 'src/avatar/saveOnServer/entity/AvatarLocal.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @Column({ unique: true, nullable: true })
  username: string;

  @Exclude()
  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ nullable: true })
  phon: string;

  @Exclude()
  @Column({ default: false })
  isEmailConfirmed: boolean;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.OTHER,
    nullable: true,
  })
  gender: Gender;

  @Column({ nullable: true })
  lastName: string;

  @Exclude()
  @Column({
    nullable: true,
  })
  @Exclude()
  hashedRefresh: string;

  @JoinColumn({ name: 'avatarId' })
  @OneToOne(() => Avatar, { nullable: true })
  avatar: Avatar;

  @Column({ nullable: true })
  avatarId: string;

  @Exclude()
  @JoinColumn()
  @OneToOne(() => AvatarLocal, { nullable: true })
  AvatarLocal: AvatarLocal;

  @Column({ default: false })
  isRegisteredWithGoogle: boolean;
}