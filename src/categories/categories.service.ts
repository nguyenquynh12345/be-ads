import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll() {
    return this.categoryRepository.find();
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(data: Partial<Category>) {
    // Basic slug generation
    if (data.name && !data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
      
      // Basic check for existing slug
      const existing = await this.categoryRepository.findOne({ where: { slug: data.slug } });
      if (existing) {
        data.slug += '-' + Date.now();
      }
    }
    const category = this.categoryRepository.create(data);
    return this.categoryRepository.save(category);
  }

  async update(id: number, data: Partial<Category>) {
    await this.findOne(id);
    await this.categoryRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    return this.categoryRepository.remove(category);
  }
}
