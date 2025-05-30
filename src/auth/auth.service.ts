import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Auth, AuthDocument } from './entities/auth.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from  './dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    private jwtService: JwtService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    try {
      const existingUser = await this.authModel.findOne({ email: createAuthDto.email });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(createAuthDto.password, saltRounds);

      const verificationToken = crypto.randomBytes(32).toString('hex');

      const createdAuth = new this.authModel({
        ...createAuthDto,
        password: hashedPassword,
        resetToken: verificationToken, 
        resetTokenExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000), 
      });

      const savedUser = await createdAuth.save();
      
      
      const { password, ...result } = savedUser.toObject();
      
      return {
        success: true,
        message: 'User created successfully',
        data: result,
        verificationToken,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async login(loginAuthDto: LoginAuthDto) {
    try {
      const user = await this.authModel.findOne({ email: loginAuthDto.email });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(loginAuthDto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isVerified) {
        throw new UnauthorizedException('Email not verified');
      }

      const payload = { sub: user._id, email: user.email };
      const token = this.jwtService.sign(payload);

      return {
        success: true,
        message: 'Login successful',
        data: {
          access_token: token,
          user: {
            id: user._id,
            email: user.email,
            isVerified: user.isVerified,
          },
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error(`Error during login: ${error.message}`);
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    try {
      const user = await this.authModel.findOne({
        resetToken: verifyEmailDto.token,
        resetTokenExpiration: { $gt: new Date() },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid or expired verification token');
      }

      user.isVerified = true;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      await user.save();

      return {
        success: true,
        message: 'Email verified successfully',
        data: {
          email: user.email,
          isVerified: user.isVerified,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error(`Error verifying email: ${error.message}`);
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await this.authModel.findOne({ email: forgotPasswordDto.email });
      if (!user) {
        return {
          success: true,
          message: 'If the email exists, a reset link has been sent',
        };
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetToken = resetToken;
      user.resetTokenExpiration = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hora
      await user.save();

      return {
        success: true,
        message: 'Password reset token generated',
        resetToken, 
      };
    } catch (error) {
      throw new Error(`Error generating reset token: ${error.message}`);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const user = await this.authModel.findOne({
        resetToken: resetPasswordDto.token,
        resetTokenExpiration: { $gt: new Date() },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid or expired reset token');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, saltRounds);

      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      await user.save();

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error(`Error resetting password: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const users = await this.authModel.find().select('-password');
      return {
        success: true,
        data: users,
      };
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.authModel.findById(id).select('-password');
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.authModel.findOne({ email }).select('-password');
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async update(id: string, updateAuthDto: UpdateAuthDto) {
    try {
      const user = await this.authModel.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (updateAuthDto.password) {
        const saltRounds = 10;
        updateAuthDto.password = await bcrypt.hash(updateAuthDto.password, saltRounds);
      }

      const updatedUser = await this.authModel
        .findByIdAndUpdate(id, updateAuthDto, { new: true })
        .select('-password');

      return {
        success: true,
        message: 'User updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const user = await this.authModel.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.authModel.findByIdAndDelete(id);
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.authModel.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

    async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      
      // Verificar que el usuario aún existe y está activo
      const user = await this.authModel.findById(payload.sub);
      if (!user || !user.isVerified) {
        throw new UnauthorizedException('Invalid token - user not found or not verified');
      }

      return {
        success: true,
        message: 'Token is valid',
        data: {
          sub: payload.sub,
          email: payload.email,
          iat: payload.iat,
          exp: payload.exp,
        },
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token format');
      }
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Token validation failed');
    }
  }



    async getUserFromToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.authModel.findById(payload.sub).select('-password');
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }


  async refreshToken(oldToken: string) {
    try {
      const payload = this.jwtService.verify(oldToken);
      const user = await this.authModel.findById(payload.sub);
      
      if (!user || !user.isVerified) {
        throw new UnauthorizedException('Cannot refresh token');
      }

      const newPayload = { sub: user._id, email: user.email };
      const newToken = this.jwtService.sign(newPayload);

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          access_token: newToken,
          user: {
            id: user._id,
            email: user.email,
            isVerified: user.isVerified,
          },
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Cannot refresh token');
    }
  }




}


