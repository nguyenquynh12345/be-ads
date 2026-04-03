import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { Menu } from './entities/menu.entity';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: TreeRepository<Menu>,
  ) {}

  async findAll() {
    return this.menuRepository.findTrees();
  }

  async findOne(id: number) {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });
    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }

  async create(data: Partial<Menu>) {
    const menu = this.menuRepository.create(data);
    if (data.parentId) {
      const parent = await this.findOne(data.parentId);
      menu.parent = parent;
    }
    return this.menuRepository.save(menu);
  }

  async update(id: number, data: Partial<Menu>) {
    const menu = await this.findOne(id);
    if (data.parentId) {
      const parent = await this.findOne(data.parentId);
      menu.parent = parent;
    }
    Object.assign(menu, data);
    return this.menuRepository.save(menu);
  }

  async remove(id: number) {
    const menu = await this.findOne(id);
    return this.menuRepository.remove(menu);
  }
}
