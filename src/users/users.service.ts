import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepository.find();
    return users.map(({ password, ...user }) => user as Omit<User, 'password'>);
  }

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;
    const { password, ...result } = user;
    return result as Omit<User, 'password'>;
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create({
      ...user,
      password: user.password || '123456', // Default password for new users
    });
    return this.usersRepository.save(newUser);
  }

  async update(id: number, data: Partial<User>): Promise<Omit<User, 'password'>> {
    await this.usersRepository.update(id, data);
    return this.findById(id) as Promise<Omit<User, 'password'>>;
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (user.role === 'Admin') {
      throw new ForbiddenException('Không thể xóa tài khoản Quản trị viên (Admin)');
    }
    await this.usersRepository.delete(id);
  }
}
