import { Controller, Get, Post, Put, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('clients')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Post()
  @Permissions('CLIENTS_MANAGE')
  create(@Req() req: any, @Body() body: any) {
    return this.service.create(req.user.id, body);
  }

  @Get()
  @Permissions('CLIENTS_VIEW')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Permissions('CLIENTS_VIEW')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Put(':id')
  @Permissions('CLIENTS_MANAGE')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.update(req.user.id, Number(id), body);
  }
}
