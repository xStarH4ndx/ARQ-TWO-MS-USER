import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async create(createUserData: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.userModel.findOne({ email: createUserData.email }).exec();
      if (existingUser) {
        throw new ConflictException(`User with email ${createUserData.email} already exists`);
      }

      const createdUser = new this.userModel(createUserData);
      return await createdUser.save();
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
      
      throw error;
    }
  }

  async findAll(limit?: number, offset?: number): Promise<{ users: User[]; total: number }> {
    try {
      const query = this.userModel.find();
      
      if (offset !== undefined) {
        query.skip(offset);
      }
      if (limit !== undefined) {
        query.limit(limit);
      }
      
      const [users, total] = await Promise.all([
        query.exec(),
        this.userModel.countDocuments().exec()
      ]);
      
      return { users, total };
    } catch (error) {
      throw new BadRequestException('Error retrieving users');
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid user ID format');
      }

      const user = await this.userModel.findById(id).exec();
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      return user;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error retrieving user');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      if (!email || !this.isValidEmail(email)) {
        throw new BadRequestException('Invalid email format');
      }
      
      return await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error finding user by email');
    }
  }

  async update(id: string, updateUserData: Partial<UpdateUserDto>): Promise<User> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid user ID format');
      }

      if (updateUserData.email) {
        const existingUser = await this.userModel.findOne({ 
          email: updateUserData.email,
          _id: { $ne: id } 
        }).exec();
        
        if (existingUser) {
          throw new ConflictException(`Email ${updateUserData.email} is already in use`);
        }
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(
        id, 
        updateUserData, 
        { 
          new: true,           
          runValidators: true  
        }
      ).exec();

      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      
      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map((err: any) => err.message);
        throw new BadRequestException(`Validation failed: ${errorMessages.join(', ')}`);
      }
      
      throw new BadRequestException('Error updating user');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid user ID format');
      }

      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
      
      if (!deletedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error deleting user');
    }
  }

  async findByPartialName(name: string, limit: number = 10): Promise<User[]> {
    try {
      return await this.userModel
        .find({
          $or: [
            { firstName: { $regex: name, $options: 'i' } },
            { lastName: { $regex: name, $options: 'i' } }
          ]
        })
        .limit(limit)
        .exec();
    } catch (error) {
      throw new BadRequestException('Error searching users by name');
    }
  }

  async getUserStats(): Promise<{ totalUsers: number; recentUsers: number }> {
    try {
      const totalUsers = await this.userModel.countDocuments().exec();
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentUsers = await this.userModel.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
      }).exec();
      
      return { totalUsers, recentUsers };
    } catch (error) {
      throw new BadRequestException('Error retrieving user statistics');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return false;
      }
      
      const user = await this.userModel.findById(id).select('_id').exec();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}