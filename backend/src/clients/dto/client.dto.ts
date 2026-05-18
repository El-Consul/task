import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  unitCode!: string;

  @IsString()
  @IsOptional()
  unitNumber?: string;

  @IsNumber()
  @IsOptional()
  unitArea?: number;

  @IsNumber()
  @IsOptional()
  groupId?: number;
}

export class UpdateClientDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  unitCode?: string;

  @IsString()
  @IsOptional()
  unitNumber?: string;

  @IsNumber()
  @IsOptional()
  unitArea?: number;

  @IsNumber()
  @IsOptional()
  groupId?: number;
}
