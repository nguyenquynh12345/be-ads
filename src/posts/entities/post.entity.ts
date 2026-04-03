import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ default: 'published' })
  status: string;

  @ManyToOne(() => User)
  author: User;

  @Column()
  authorId: number;

  @ManyToOne(() => Category, (category) => category.posts, { nullable: true })
  category: Category;

  @Column({ nullable: true })
  categoryId: number;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  chapters: number;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ nullable: true })
  badge: string;

  @Column({ nullable: true })
  color: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
