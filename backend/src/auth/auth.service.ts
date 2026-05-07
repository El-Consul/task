import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
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
      permissions: user.permissions 
    } };
  }

  async register(data: { email: string; password: string; name: string; role: string; permissions?: string[] }) {
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: { ...data, password: hashed, permissions: data.permissions || [] },
    });
    return { id: user.id, email: user.email, name: user.name, role: user.role, permissions: user.permissions };
  }
}
