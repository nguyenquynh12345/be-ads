import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
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
      const payload = { username: user.username, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async updateProfile(id: number, data: any) {
    const { id: _, ...updateData } = data;
    await this.usersService.update(id, updateData);
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
