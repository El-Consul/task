import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
// Trigger IDE re-scan of Prisma types
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const token = this.jwtService.sign({ 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name,
      permissions: user.permissions 
    });
    return { token, user: { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name,
      permissions: JSON.parse(user.permissions || '[]')
    } };
  }

  async register(data: { email: string; password: string; name: string; role: string; permissions?: string[] }) {
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: { ...data, password: hashed, permissions: JSON.stringify(data.permissions || []) },
    });
    return { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role, 
      permissions: JSON.parse(user.permissions || '[]')
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'If email exists, a reset link has been sent.' };
    }

    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await (this.prisma.user as any).update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    console.log(`[Email Service Mock] Password reset token for ${email}: ${resetToken}`);
    return { message: 'If email exists, a reset link has been sent.', mockToken: resetToken };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await (this.prisma.user as any).findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await (this.prisma.user as any).update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password has been reset successfully' };
  }
}
