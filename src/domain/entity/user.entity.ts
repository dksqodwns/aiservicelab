import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseDateTime } from './date.entity';
import { Grade } from './eunm/grade';
import { Status } from './eunm/status';

@Entity()
export class User extends BaseDateTime {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'phone' })
  phone: string;

  @Column({ name: 'password' })
  password: string;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string;

  @Column({ name: 'birthday' })
  birthday: string;

  @Column({ name: 'grade', default: 'ASSOCIATE' })
  grade: Grade;

  @Column({ name: 'status', default: 'STUDENT' })
  status: Status;
}
