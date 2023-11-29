import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AvatarLocal {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column()
  mimetype: string;
}
