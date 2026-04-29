import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { loginSchema } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Body() body: any) {
    const validated = loginSchema.parse(body);
    return this.authService.login(validated);
  }

  @Post('refresh')
  @UseGuards(JwtGuard)
  async refreshToken(@Request() req: any) {
    return this.authService.refreshToken(req.user.sub);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  async logout(@Request() req: any) {
    // In a production app, you might want to blacklist the token
    return { message: 'Logged out successfully' };
  }
}
