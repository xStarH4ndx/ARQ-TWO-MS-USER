import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Houses, HousesDocument } from './entities/house.entity';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';

@Injectable()
export class HousesService {
  constructor(
    @InjectModel(Houses.name) private houseModel: Model<HousesDocument>
  ) {}

  async create(createHouseDto: CreateHouseDto): Promise<Houses> {
    try {
      const existingHouse = await this.houseModel.findOne({ codigo: createHouseDto.codigo }).exec();
      if (existingHouse) {
        throw new ConflictException(`House with code ${createHouseDto.codigo} already exists`);
      }

      const createdHouse = new this.houseModel(createHouseDto);
      return await createdHouse.save();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map((err: any) => err.message);
        throw new BadRequestException(`Validation failed: ${errorMessages.join(', ')}`);
      }
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ConflictException(`${field} already exists`);
      }
      
      throw new BadRequestException('Error creating house');
    }
  }

  async findAll(limit?: number, offset?: number): Promise<{ houses: Houses[]; total: number }> {
    try {
      const query = this.houseModel.find();
      
      if (offset !== undefined) {
        query.skip(offset);
      }
      if (limit !== undefined) {
        query.limit(limit);
      }
      
      const [houses, total] = await Promise.all([
        query.exec(),
        this.houseModel.countDocuments().exec()
      ]);
      
      return { houses, total };
    } catch (error) {
      throw new BadRequestException('Error retrieving houses');
    }
  }

  async findOne(id: string): Promise<Houses> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid house ID format');
      }

      const house = await this.houseModel.findById(id).exec();
      
      if (!house) {
        throw new NotFoundException(`House with ID ${id} not found`);
      }
      
      return house;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error retrieving house');
    }
  }

  async findByCode(codigo: string): Promise<Houses | null> {
    try {
      if (!codigo || codigo.trim() === '') {
        throw new BadRequestException('House code cannot be empty');
      }
      
      return await this.houseModel.findOne({ codigo: codigo.trim() }).exec();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error finding house by code');
    }
  }

  async update(id: string, updateHouseDto: UpdateHouseDto): Promise<Houses> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid house ID format');
      }

      if (updateHouseDto.codigo) {
        const existingHouse = await this.houseModel.findOne({ 
          codigo: updateHouseDto.codigo,
          _id: { $ne: id } 
        }).exec();
        
        if (existingHouse) {
          throw new ConflictException(`House code ${updateHouseDto.codigo} is already in use`);
        }
      }

      const updatedHouse = await this.houseModel.findByIdAndUpdate(
        id, 
        updateHouseDto, 
        { 
          new: true,           
          runValidators: true  
        }
      ).exec();

      if (!updatedHouse) {
        throw new NotFoundException(`House with ID ${id} not found`);
      }

      return updatedHouse;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      

      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map((err: any) => err.message);
        throw new BadRequestException(`Validation failed: ${errorMessages.join(', ')}`);
      }
      
      throw new BadRequestException('Error updating house');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid house ID format');
      }

      const deletedHouse = await this.houseModel.findByIdAndDelete(id).exec();
      
      if (!deletedHouse) {
        throw new NotFoundException(`House with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error deleting house');
    }
  }

  // ==================== MÉTODOS ESPECÍFICOS PARA GESTIÓN DE USUARIOS ====================

async addUserToHouse(codigo: string, userId: string, nombre: string): Promise<Houses> {
  try {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const house = await this.houseModel.findOne({ 
      nombre: nombre, 
      codigo: codigo 
    }).exec();
    
    if (!house) {
      throw new NotFoundException(`House with name "${nombre}" and code "${codigo}" not found`);
    }

    if (house.userIds.includes(userId)) {
      throw new ConflictException(`User ${userId} is already in this house`);
    }

    const updatedHouse = await this.houseModel.findByIdAndUpdate(
      house._id,
      { $push: { userIds: userId } },
      { new: true, runValidators: true }
    ).exec();

    return updatedHouse!;
  } catch (error) {
    if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
      throw error;
    }
    throw new BadRequestException('Error adding user to house');
  }
}

    async addUserToHouseById(houseId: string, userId: string): Promise<Houses> {
    try {
      if (!Types.ObjectId.isValid(houseId)) {
        throw new BadRequestException('Invalid house ID format');
      }

      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }

      const house = await this.houseModel.findById(houseId).exec();
      if (!house) {
        throw new NotFoundException(`House with ID ${houseId} not found`);
      }

      if (house.userIds.includes(userId)) {
        throw new ConflictException(`User ${userId} is already in this house`);
      }

      const updatedHouse = await this.houseModel.findByIdAndUpdate(
        houseId,
        { $push: { userIds: userId } },
        { new: true, runValidators: true }
      ).exec();

      return updatedHouse!;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error adding user to house');
    }
  }


  async removeUserFromHouse(houseId: string, userId: string): Promise<Houses> {
    try {
      if (!Types.ObjectId.isValid(houseId)) {
        throw new BadRequestException('Invalid house ID format');
      }

      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }

      const house = await this.houseModel.findById(houseId).exec();
      if (!house) {
        throw new NotFoundException(`House with ID ${houseId} not found`);
      }

      if (!house.userIds.includes(userId)) {
        throw new NotFoundException(`User ${userId} is not in this house`);
      }

      const updatedHouse = await this.houseModel.findByIdAndUpdate(
        houseId,
        { $pull: { userIds: userId } },
        { new: true, runValidators: true }
      ).exec();

      return updatedHouse!;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error removing user from house');
    }
  }

  async getUsersInHouse(houseId: string): Promise<string[]> {
    try {
      if (!Types.ObjectId.isValid(houseId)) {
        throw new BadRequestException('Invalid house ID format');
      }

      const house = await this.houseModel.findById(houseId).select('userIds').exec();
      
      if (!house) {
        throw new NotFoundException(`House with ID ${houseId} not found`);
      }

      return house.userIds;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error retrieving users in house');
    }
  }

  async getHousesByUser(userId: string): Promise<Houses[]> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }

      return await this.houseModel.find({ userIds: userId }).exec();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error retrieving houses for user');
    }
  }

  // ==================== MÉTODOS ADICIONALES  ====================

  async findByPartialName(name: string, limit: number = 10): Promise<Houses[]> {
    try {
      return await this.houseModel
        .find({
          $or: [
            { nombre: { $regex: name, $options: 'i' } },
            { descripcion: { $regex: name, $options: 'i' } }
          ]
        })
        .limit(limit)
        .exec();
    } catch (error) {
      throw new BadRequestException('Error searching houses by name');
    }
  }

  async getHouseStats(): Promise<{ 
    totalHouses: number; 
    recentHouses: number; 
    housesWithUsers: number;
    housesWithoutUsers: number;
    averageUsersPerHouse: number;
  }> {
    try {
      const totalHouses = await this.houseModel.countDocuments().exec();
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentHouses = await this.houseModel.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
      }).exec();

      const housesWithUsers = await this.houseModel.countDocuments({
        userIds: { $ne: [] }
      }).exec();

      const housesWithoutUsers = totalHouses - housesWithUsers;

      const allHouses = await this.houseModel.find().select('userIds').exec();
      const totalUsers = allHouses.reduce((sum, house) => sum + house.userIds.length, 0);
      const averageUsersPerHouse = totalHouses > 0 ? totalUsers / totalHouses : 0;
      
      return { 
        totalHouses, 
        recentHouses, 
        housesWithUsers,
        housesWithoutUsers,
        averageUsersPerHouse: Math.round(averageUsersPerHouse * 100) / 100
      };
    } catch (error) {
      throw new BadRequestException('Error retrieving house statistics');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return false;
      }
      
      const house = await this.houseModel.findById(id).select('_id').exec();
      return !!house;
    } catch (error) {
      return false;
    }
  }

  async isUserInHouse(houseId: string, userId: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(houseId) || !Types.ObjectId.isValid(userId)) {
        return false;
      }
      
      const house = await this.houseModel.findOne({
        _id: houseId,
        userIds: userId
      }).select('_id').exec();
      
      return !!house;
    } catch (error) {
      return false;
    }
  }

  async cleanInvalidUsers(validUserIds: string[]): Promise<number> {
    try {
      const result = await this.houseModel.updateMany(
        {},
        { $pullAll: { userIds: { $nin: validUserIds } } }
      ).exec();
      
      return result.modifiedCount;
    } catch (error) {
      throw new BadRequestException('Error cleaning invalid users from houses');
    }
  }
}