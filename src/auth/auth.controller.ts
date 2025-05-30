import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
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

  @MessagePattern('auth.register')
  async register(@Payload() createAuthDto: CreateAuthDto) {
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

  @MessagePattern('auth.login')
  async login(@Payload() loginAuthDto: LoginAuthDto) {
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

  @MessagePattern('auth.verify-email')
  async verifyEmail(@Payload() verifyEmailDto: VerifyEmailDto) {
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

  @MessagePattern('auth.forgot-password')
  async forgotPassword(@Payload() forgotPasswordDto: ForgotPasswordDto) {
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

  @MessagePattern('auth.reset-password')
  async resetPassword(@Payload() resetPasswordDto: ResetPasswordDto) {
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

  @MessagePattern('auth.findAll')
  async findAll() {
    try {
      return await this.authService.findAll();
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @MessagePattern('auth.findOne')
  async findOne(@Payload() data: { id: string }) {
    try {
      return await this.authService.findOne(data.id);
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @MessagePattern('auth.findByEmail')
  async findByEmail(@Payload() data: { email: string }) {
    try {
      return await this.authService.findByEmail(data.email);
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @MessagePattern('auth.update')
  async update(@Payload() data: { id: string; updateAuthDto: UpdateAuthDto }) {
    try {
      return await this.authService.update(data.id, data.updateAuthDto);
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @MessagePattern('auth.remove')
  async remove(@Payload() data: { id: string }) {
    try {
      return await this.authService.remove(data.id);
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @MessagePattern('auth.validate-user')
  async validateUser(@Payload() data: { email: string; password: string }) {
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
}