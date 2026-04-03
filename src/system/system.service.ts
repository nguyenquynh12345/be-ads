import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { Post } from '../posts/entities/post.entity';
import { Category } from '../categories/entities/category.entity';
import { Menu } from '../menus/entities/menu.entity';

@Injectable()
export class SystemService implements OnModuleInit {
  constructor(
    @InjectRepository(SystemSetting)
    private settingsRepository: Repository<SystemSetting>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  async onModuleInit() {
    // Initialize default settings if they don't exist
    await this.ensureSetting('is_cron_enabled', 'true');
  }

  private async ensureSetting(key: string, defaultValue: string) {
    const exists = await this.settingsRepository.findOne({ where: { key } });
    if (!exists) {
      await this.settingsRepository.save({ key, value: defaultValue });
    }
  }

  async getSetting(key: string): Promise<string | null> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await this.settingsRepository.save({ key, value });
  }

  async findAll(): Promise<SystemSetting[]> {
    return this.settingsRepository.find();
  }

  async seed() {
    // 1. Seed Categories
    const genres = [
      { name: "Tiên Hiệp", icon: "bi-stars", color: "#6366f1" },
      { name: "Kiếm Hiệp", icon: "bi-shield", color: "#0891b2" },
      { name: "Ngôn Tình", icon: "bi-heart", color: "#16a34a" },
      { name: "Đô Thị", icon: "bi-building", color: "#e74c3c" },
      { name: "Huyền Huyễn", icon: "bi-magic", color: "#7c3aed" },
    ];

    const savedCategories: Category[] = [];
    for (const g of genres) {
      let cat = await this.categoryRepository.findOne({ where: { name: g.name } });
      if (!cat) {
        cat = this.categoryRepository.create({
          name: g.name,
          slug: g.name.toLowerCase().replace(/ /g, '-'),
          icon: g.icon,
          color: g.color,
        });
        cat = await this.categoryRepository.save(cat);
      }
      savedCategories.push(cat);
    }

    // 2. Seed Posts (Novels)
    const novels = [
      {
        title: "Đấu Phá Thương Khung",
        description: "Tại đại lục Đấu Khí, không có ma pháp, chỉ có đấu khí...",
        isFeatured: true,
        badge: "Hot",
        color: "#6366f1",
        views: 125000000,
        chapters: 1648,
        categoryName: "Tiên Hiệp",
      },
      {
        title: "Tru Tiên",
        description: "Trương Tiểu Phàm một lần tình cờ học được bí kíp tà đạo...",
        isFeatured: true,
        badge: "Classic",
        color: "#0891b2",
        views: 89000000,
        chapters: 347,
        categoryName: "Kiếm Hiệp",
      },
      {
        title: "Toàn Chức Pháp Sư",
        description: "Mạc Phàm tỉnh dậy thấy thế giới đã thay đổi...",
        isFeatured: false,
        badge: "Top 1",
        color: "#7c3aed",
        views: 98000000,
        chapters: 2892,
        categoryName: "Huyền Huyễn",
      },
    ];

    for (const n of novels) {
      const existing = await this.postsRepository.findOne({ where: { title: n.title } });
      if (!existing) {
        const cat = savedCategories.find(c => c.name === n.categoryName);
        const post = this.postsRepository.create({
          title: n.title,
          slug: n.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
          content: n.description, // using description for content too in seed
          description: n.description,
          isFeatured: n.isFeatured,
          badge: n.badge,
          color: n.color,
          views: n.views,
          chapters: n.chapters,
          categoryId: cat?.id,
          authorId: 1, // assuming user 1 exists
          status: 'published',
        });
        await this.postsRepository.save(post);
      }
    }

    // 3. Seed Menus
    const menuItems = [
      { title: "Trang chủ", url: "/", icon: "bi-house-fill", order: 1 },
      { title: "Thể loại", url: "#", icon: "bi-grid", order: 2 },
      { title: "Diễn đàn", url: "/dien-dan", icon: "bi-chat-dots", order: 3 },
      { title: "Tìm kiếm", url: "/tim-kiem", icon: "bi-search", order: 4 },
    ];

    for (const m of menuItems) {
      const existing = await this.menuRepository.findOne({ where: { title: m.title } });
      if (!existing) {
        const menu = this.menuRepository.create(m);
        await this.menuRepository.save(menu);
      }
    }

    return { message: 'Seed completed' };
  }
}
