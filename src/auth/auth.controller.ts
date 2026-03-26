import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body.username, body.password);
  }

  @Get('profile/:id')
  async getProfile(@Param('id') id: string) {
    return this.authService.getProfile(+id);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body.username, body.password);
  }

  @Post('profile')
  async updateProfile(@Body() body: any) {
    return this.authService.updateProfile(body.id, body);
  }
}
