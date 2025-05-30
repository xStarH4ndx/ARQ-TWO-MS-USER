import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UsersService', 'CreateUserProfile')
  async createUserProfile(data: any) {
    try {
      const user = await this.usersService.createUserProfile(data);
      return { user };
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  @GrpcMethod('UsersService', 'FindAllUsers')
  async findAllUsers(data: { limit?: number; offset?: number }) {
    try {
      const result = await this.usersService.findAll(data.limit, data.offset);
      return result;
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  @GrpcMethod('UsersService', 'FindOneUser')
  async findOneUser(data: { id: string }) {
    try {
      const user = await this.usersService.findOne(data.id);
      return { user };
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  @GrpcMethod('UsersService', 'FindByAuthId')
  async findByAuthId(data: { authId: string }) {
    try {
      const user = await this.usersService.findByAuthId(data.authId);
      return { user, found: !!user };
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  @GrpcMethod('UsersService', 'FindByEmail')
  async findByEmail(data: { email: string }) {
    try {
      const user = await this.usersService.findByEmail(data.email);
      return { user, found: !!user };
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  @GrpcMethod('UsersService', 'UpdateUser')
  async updateUser(data: { id: string; updateData: any }) {
    try {
      const user = await this.usersService.update(data.id, data.updateData);
      return { user };
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  @GrpcMethod('UsersService', 'UpdateByAuthId')
  async updateByAuthId(data: { authId: string; updateData: any }) {
    try {
      const user = await this.usersService.updateByAuthId(data.authId, data.updateData);
      return { user };
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  @GrpcMethod('UsersService', 'DeleteUser')
  async deleteUser(data: { id: string }) {
    try {
      await this.usersService.remove(data.id);
      return { success: true };
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  @GrpcMethod('UsersService', 'DeleteByAuthId')
  async deleteByAuthId(data: { authId: string }) {
    try {
      await this.usersService.removeByAuthId(data.authId);
      return { success: true };
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  @GrpcMethod('UsersService', 'SearchUsersByName')
  async searchUsersByName(data: { name: string; limit?: number }) {
    try {
      const users = await this.usersService.findByPartialName(data.name, data.limit || 10);
      return { users };
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  @GrpcMethod('UsersService', 'GetUserStats')
  async getUserStats() {
    try {
      const stats = await this.usersService.getUserStats();
      return stats;
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  @GrpcMethod('UsersService', 'UserExists')
  async userExists(data: { id: string }) {
    try {
      const exists = await this.usersService.exists(data.id);
      return { exists };
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  @GrpcMethod('UsersService', 'UserExistsByAuthId')
  async userExistsByAuthId(data: { authId: string }) {
    try {
      const exists = await this.usersService.existsByAuthId(data.authId);
      return { exists };
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  private handleGrpcError(error: any): never {
    if (error.message?.includes('not found') || error.message?.includes('Not found')) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: error.message,
      });
    }
    
    if (error.message?.includes('already exists') || error.message?.includes('Conflict')) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: error.message,
      });
    }
    
    if (error.message?.includes('Invalid') || error.message?.includes('Validation')) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: error.message,
      });
    }
    
    throw new RpcException({
      code: status.INTERNAL,
      message: error.message || 'Internal server error',
    });
  }
}