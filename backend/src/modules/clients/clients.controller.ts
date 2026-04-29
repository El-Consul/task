import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ClientStatus } from '@prisma/client';

@Controller('clients')
@UseGuards(JwtGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @Roles('ADMIN', 'ACCOUNTANT', 'SALES_AGENT')
  findAll(
    @Query('status') status?: ClientStatus,
    @Query('departmentId') departmentId?: string,
    @Query('assignedAgentId') assignedAgentId?: string,
    @Query('search') search?: string,
  ) {
    return this.clientsService.findAll({
      status,
      departmentId,
      assignedAgentId,
      search,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'ACCOUNTANT', 'SALES_AGENT')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'SALES_AGENT')
  create(@Body() body: any) {
    return this.clientsService.create(body);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SALES_AGENT')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return this.clientsService.update(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientsService.remove(id);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'ACCOUNTANT')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ClientStatus,
  ) {
    return this.clientsService.updateStatus(id, status);
  }
}
