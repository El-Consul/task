import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('departments')
@UseGuards(JwtGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @Roles('ADMIN', 'ACCOUNTANT', 'SALES_AGENT')
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'ACCOUNTANT', 'SALES_AGENT')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.findById(id);
  }

  @Get('code/:code')
  @Roles('ADMIN', 'ACCOUNTANT', 'SALES_AGENT')
  findByCode(@Param('code') code: string) {
    return this.departmentsService.findByCode(code);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() body: any) {
    return this.departmentsService.create(body);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return this.departmentsService.update(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.remove(id);
  }
}
