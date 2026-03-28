import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(username: string, pass: string) {
    const userExists = await this.usersService.findOne(username);
    if (userExists) {
      throw new ConflictException('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await this.usersService.create({
      username,
      password: hashedPassword,
    });
    const { password, ...result } = user;
    return result;
  }

  async login(username: string, pass: string) {
    const user = await this.usersService.findOne(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Kiểm tra trạng thái tài khoản
      if (user.status !== 'active') {
        throw new ForbiddenException('Tài khoản đã bị khóa hoặc chưa được kích hoạt');
      }

      const payload = { username: user.username, sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async updateProfile(id: number, data: any) {
    const { fullName, email, avatarUrl, avatarThumbnailUrl, phone, bio, language } = data;
    await this.usersService.update(id, { 
      fullName, 
      email, 
      avatarUrl, 
      avatarThumbnailUrl,
      phone, 
      bio, 
      language 
    });
    return { message: 'Profile updated successfully' };
  }

  async getProfile(id: number) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...result } = user;
    return result;
  }
}
