import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type SchedulerStatus = 'pending' | 'running' | 'done' | 'failed';
export type SchedulerRepeat = 'none' | 'daily' | 'weekly' | 'monthly';

@Entity('scheduler')
export class Scheduler {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'datetime' })
  scheduledAt: Date;

  @Column({ default: 'pending' })
  status: SchedulerStatus;

  @Column({ nullable: true })
  type: string;

  @Column({ default: 'none' })
  repeatInterval: SchedulerRepeat;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
