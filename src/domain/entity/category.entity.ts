import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  id: number;

  @Column({ name: 'category_name' })
  categoryName: string;
}
