import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { rabbitmqConfig } from './rabbitmq/rabbitmq.config';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  // Rutas de los proto
  const userProtoPath = join(__dirname, '../proto/users.proto');
  const housesProtoPath = join(__dirname, '../proto/houses.proto');
  const authProtoPath = join(__dirname, '../proto/auth.proto');

  console.log('Users Proto Path:', userProtoPath);
  console.log('Houses Proto Path:', housesProtoPath);
  console.log('Auth Proto Path:', authProtoPath);

  // Microservicio gRPC
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: ['users', 'houses', 'auth'],
      protoPath: [userProtoPath, housesProtoPath, authProtoPath],
      url: '0.0.0.0:5000',
    },
  });

  // Microservicio RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqConfig.uri],
      queue: rabbitmqConfig.queue,
      queueOptions: {
        durable: true,
      },
    },
  });

  // Iniciar ambos microservicios
  await app.startAllMicroservices();
  console.log('🚀 Microservice is listening on gRPC (5000) and RabbitMQ');
}
bootstrap();
