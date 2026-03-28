import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  avatarThumbnailUrl: string;

  @Column({ default: 'User' })
  role: string;

  @Column({ default: 'active' })
  status: string;

  // ── New extended profile fields ──
  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ default: 'vi' })
  language: string;

  @CreateDateColumn()
  createdAt: Date;
}
