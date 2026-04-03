import { Entity, Column, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent } from 'typeorm';

@Entity('menus')
@Tree('materialized-path')
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: 'header' })
  position: string; // 'header', 'footer', etc.

  @TreeChildren()
  children: Menu[];

  @TreeParent()
  parent: Menu;

  @Column({ nullable: true })
  parentId: number;
}
