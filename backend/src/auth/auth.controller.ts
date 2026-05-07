import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('USERS_MANAGE')
  register(@Body() body: { email: string; password: string; name: string; role: string; permissions?: string[] }) {
    return this.authService.register(body);
  }
}
