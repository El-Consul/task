import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('departments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Post()
  @Permissions('DEPARTMENTS_MANAGE')
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':code')
  findByCode(@Param('code') code: string) {
    return this.service.findByCode(code);
  }

  @Put(':id')
  @Permissions('DEPARTMENTS_MANAGE')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}
