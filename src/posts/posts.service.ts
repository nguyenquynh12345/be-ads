import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findAll() {
    return this.postsRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['author', 'category'],
    });
  }

  async findOne(id: number) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author', 'category'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async create(data: Partial<Post>) {
    // Generate slug from title if not provided
    if (data.title && !data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
      
      // Ensure unique slug (simple version)
      const existing = await this.postsRepository.findOne({ where: { slug: data.slug } });
      if (existing) {
        data.slug += '-' + Date.now();
      }
    }
    const post = this.postsRepository.create(data);
    return this.postsRepository.save(post);
  }

  async update(id: number, data: Partial<Post>) {
    await this.findOne(id);
    await this.postsRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const post = await this.findOne(id);
    return this.postsRepository.remove(post);
  }
}
