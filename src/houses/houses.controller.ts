import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { HousesService } from './houses.service';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';

@Controller()
export class HousesController {
  constructor(private readonly housesService: HousesService) {}

  @GrpcMethod('HousesService', 'CreateHouse')
  async create(data: CreateHouseDto): Promise<any> {
    return this.housesService.create(data);
  }

  @GrpcMethod('HousesService', 'FindAllHouses')
  async findAll(data: { limit?: number; offset?: number }): Promise<any> {
    return this.housesService.findAll(data.limit, data.offset);
  }

  @GrpcMethod('HousesService', 'FindOneHouse')
  async findOne(data: { id: string }): Promise<any> {
    return this.housesService.findOne(data.id);
  }

  @GrpcMethod('HousesService', 'FindHouseByCode')
  async findByCode(data: { codigo: string }): Promise<any> {
    return this.housesService.findByCode(data.codigo);
  }

  @GrpcMethod('HousesService', 'UpdateHouse')
  async update(data: UpdateHouseDto): Promise<any> {
    return this.housesService.update(data.id, data);
  }

  @GrpcMethod('HousesService', 'RemoveHouse')
  async remove(data: { id: string }): Promise<any> {
    await this.housesService.remove(data.id);
    return { success: true };
  }

  // ==================== MÉTODOS PARA GESTIÓN DE USUARIOS EN CASAS ====================

  @GrpcMethod('HousesService', 'AddUserToHouse')
  async addUserToHouse(data: { houseId: string; userId: string }): Promise<any> {
    return this.housesService.addUserToHouse(data.houseId, data.userId);
  }

  @GrpcMethod('HousesService', 'RemoveUserFromHouse')
  async removeUserFromHouse(data: { houseId: string; userId: string }): Promise<any> {
    return this.housesService.removeUserFromHouse(data.houseId, data.userId);
  }

  @GrpcMethod('HousesService', 'GetUsersInHouse')
  async getUsersInHouse(data: { houseId: string }): Promise<any> {
    return this.housesService.getUsersInHouse(data.houseId);
  }

  @GrpcMethod('HousesService', 'GetHousesByUser')
  async getHousesByUser(data: { userId: string }): Promise<any> {
    return this.housesService.getHousesByUser(data.userId);
  }

  @GrpcMethod('HousesService', 'IsUserInHouse')
  async isUserInHouse(data: { houseId: string; userId: string }): Promise<any> {
    return this.housesService.isUserInHouse(data.houseId, data.userId);
  }

  // ==================== MÉTODOS ADICIONALES ====================

  @GrpcMethod('HousesService', 'SearchHousesByName')
  async searchHousesByName(data: { name: string; limit?: number }): Promise<any> {
    return this.housesService.findByPartialName(data.name, data.limit || 10);
  }

  @GrpcMethod('HousesService', 'GetHouseStats')
  async getHouseStats(): Promise<any> {
    return this.housesService.getHouseStats();
  }

  @GrpcMethod('HousesService', 'HouseExists')
  async houseExists(data: { id: string }): Promise<any> {
    return this.housesService.exists(data.id);
  }
}