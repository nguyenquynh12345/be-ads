import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private usersService: UsersService) {}

  async onModuleInit() {
    // Auto-create admin if database is empty
    const users = await this.usersService.findAll();
    if (users.length === 0) {
      console.log('No users found. Creating default admin...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      await this.usersService.create({
        username: 'admin',
        password: hashedPassword,
        fullName: 'Administrator',
        role: 'Admin',
      });
      console.log('Default admin created: admin / 123456');
    }
  }
  getHello(): string {
    return 'Hello World!';
  }
}
