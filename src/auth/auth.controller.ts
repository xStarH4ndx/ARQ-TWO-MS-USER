import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'Register')
  async register(createAuthDto: CreateAuthDto) {
    try {
      return await this.authService.create(createAuthDto);
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @GrpcMethod('AuthService', 'Login')
  async login(loginAuthDto: LoginAuthDto) {
    try {
      return await this.authService.login(loginAuthDto);
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @GrpcMethod('AuthService', 'VerifyEmail')
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    try {
      return await this.authService.verifyEmail(verifyEmailDto);
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @GrpcMethod('AuthService', 'ForgotPassword')
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      return await this.authService.forgotPassword(forgotPasswordDto);
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @GrpcMethod('AuthService', 'ResetPassword')
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      return await this.authService.resetPassword(resetPasswordDto);
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @GrpcMethod('AuthService', 'ValidateUser')
  async validateUser(data: { email: string; password: string }) {
    try {
      const user = await this.authService.validateUser(data.email, data.password);
      return {
        success: !!user,
        data: user,
        message: user ? 'User validated successfully' : 'Invalid credentials',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(data: { token: string }) {
    try {
      return await this.authService.validateToken(data.token);
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  // @GrpcMethod('AuthService', 'FindAllUsers')
  // async findAllUsers() {
  //   try {
  //     return await this.authService.findAll();
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //       error: error.name,
  //     };
  //   }
  // }

  // @GrpcMethod('AuthService', 'FindOneUser')
  // async findOneUser(data: { id: string }) {
  //   try {
  //     return await this.authService.findOne(data.id);
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //       error: error.name,
  //     };
  //   }
  // }

  // @GrpcMethod('AuthService', 'FindUserByEmail')
  // async findUserByEmail(data: { email: string }) {
  //   try {
  //     return await this.authService.findByEmail(data.email);
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //       error: error.name,
  //     };
  //   }
  // }

  // @GrpcMethod('AuthService', 'UpdateUser')
  // async updateUser(data: { id: string } & UpdateAuthDto) {
  //   try {
  //     const { id, ...updateData } = data;
  //     return await this.authService.update(id, updateData);
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //       error: error.name,
  //     };
  //   }
  // }

  // @GrpcMethod('AuthService', 'RemoveUser')
  // async removeUser(data: { id: string }) {
  //   try {
  //     return await this.authService.remove(data.id);
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //       error: error.name,
  //     };
  //   }
  // }
}