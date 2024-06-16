import { BaseDateTime } from './date.entity';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class Board extends BaseDateTime {
  @PrimaryGeneratedColumn({ name: 'board_id' })
  id: number;

  @Column({ name: 'category' })
  category: number;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ name: 'img', type: 'text', nullable: true })
  img: string;

  @Column({ name: 'file' })
  file: string;

  @Column({ name: 'is_deleted' })
  isDeleted: number;
}
