import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const userProtoPath = join(__dirname, '../proto/users.proto');
  const housesProtoPath = join(__dirname, '../proto/houses.proto');
  const authProtoPath = join(__dirname, '../proto/auth.proto');

  console.log('Users Proto Path:', userProtoPath);
  console.log('Houses Proto Path:', housesProtoPath);
  console.log('Auth Proto Path:', authProtoPath);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: ['users', 'houses', 'auth'], 
      protoPath: [userProtoPath, housesProtoPath, authProtoPath],
      url: '0.0.0.0:5000',
    },
  });
  
  console.log('🚀 Microservice is listening on port 5000');
  await app.listen();
}
bootstrap();