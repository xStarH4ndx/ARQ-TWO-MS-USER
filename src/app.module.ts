import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { HousesModule } from './houses/houses.module';
import { AuthModule } from './auth/auth.module';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';

dotenv.config();
@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    UsersModule,
    HousesModule,
    AuthModule,
  ],
  providers: [AppService], 
})
export class AppModule {}