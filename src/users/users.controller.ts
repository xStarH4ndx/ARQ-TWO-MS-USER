import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UsersService', 'CreateUser')
  async create(data: CreateUserDto): Promise<any> {
    return this.usersService.create(data);
  }

  @GrpcMethod('UsersService', 'FindAllUsers')
  async findAll(): Promise<any> {
    return this.usersService.findAll();
  }

  @GrpcMethod('UsersService', 'FindOneUser')
  async findOne(data: { id: string }): Promise<any> {
    return this.usersService.findOne(data.id);
  }

  @GrpcMethod('UsersService', 'UpdateUserDto')
  async update(data: UpdateUserDto): Promise<any> {
    const { id, ...updateData } = data;
    return this.usersService.update(id, updateData);
  }

  @GrpcMethod('UsersService', 'RemoveUser')
  async remove(data: { id: string }): Promise<any> {
    await this.usersService.remove(data.id);
    return {};
  }
}