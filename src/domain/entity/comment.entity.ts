import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseDateTime } from './date.entity';

export class Comment extends BaseDateTime {
  @PrimaryGeneratedColumn({ name: 'comment_id' })
  id: number;

  @Column({ name: 'content', type: 'text' })
  content: string;
}
