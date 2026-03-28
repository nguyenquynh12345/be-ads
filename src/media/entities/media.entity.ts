import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column()
  filename: string;

  @Column()
  url: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  uploaderId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaderId' })
  uploader: User;

  @CreateDateColumn()
  createdAt: Date;
}
