import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { ClientsModule } from './modules/clients/clients.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { PrismaModule } from './common/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DepartmentsModule,
    ClientsModule,
    AuditLogsModule,
  ],
})
export class AppModule {}
