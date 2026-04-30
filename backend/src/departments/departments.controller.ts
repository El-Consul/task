import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  @Roles('ADMIN', 'ACCOUNTANT', 'SALES_AGENT')
  findAll() {
    return this.service.findAll();
  }

  @Get(':code')
  @Roles('ADMIN', 'ACCOUNTANT', 'SALES_AGENT')
  findByCode(@Param('code') code: string) {
    return this.service.findByCode(code);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}
