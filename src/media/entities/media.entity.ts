import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  url: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @CreateDateColumn()
  createdAt: Date;
}
