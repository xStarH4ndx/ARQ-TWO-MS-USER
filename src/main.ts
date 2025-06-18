import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { rabbitmqConfig } from './rabbitmq/rabbitmq.config';

async function bootstrap() {
  dotenv.config();

  // Crear la aplicación Nest estándar
  const app = await NestFactory.create(AppModule);

  // Conectar gRPC como microservicio
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: ['users', 'houses', 'auth'],
      protoPath: [
        join(__dirname, '../proto/users.proto'),
        join(__dirname, '../proto/houses.proto'),
        join(__dirname, '../proto/auth.proto'),
      ],
      url: 'apigateway:5000',
    },
  });

  // Conectar RabbitMQ como segundo microservicio
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