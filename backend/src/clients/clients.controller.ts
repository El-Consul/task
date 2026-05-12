import { Controller, Get, Post, Put, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('clients')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Post()
  @Permissions('CLIENTS_MANAGE')
  create(@Req() req: any, @Body() body: CreateClientDto) {
    return this.service.create(req.user.id, body);
  }

  @Get()
  @Permissions('CLIENTS_VIEW')
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('CLIENTS_VIEW')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Put(':id')
  @Permissions('CLIENTS_MANAGE')
  update(@Req() req: any, @Param('id') id: string, @Body() body: UpdateClientDto) {
    return this.service.update(req.user.id, Number(id), body);
  }
}
