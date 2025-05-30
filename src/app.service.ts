import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {
    console.log('AppService ha sido creado');
  }

  onModuleInit() {
    console.log('onModuleInit ejecutado');

    console.log('Estado actual de la conexión:', this.connection.readyState);
    console.log('Estados: 0=desconectado, 1=conectado, 2=conectando, 3=desconectando');
    
    if (this.connection.readyState === 1) {
      console.log('✅ MongoDB ya está conectado');
      console.log('Base de datos:', this.connection.db?.databaseName);
      console.log('Host:', this.connection.host);
      console.log('Puerto:', this.connection.port);
    } else {
      console.log('⏳ MongoDB aún no está conectado, estado:', this.connection.readyState);
    }

    this.connection.on('connected', () => {
      console.log('🔗 Evento: Conectado a la base de datos MongoDB');
    });

    this.connection.on('error', (err) => {
      console.error('❌ Error de conexión a MongoDB:', err);
    });

    this.connection.on('disconnected', () => {
      console.log('🔌 Evento: Desconectado de MongoDB');
    });

    this.connection.once('open', () => {
      console.log('🚪 Evento: La conexión a MongoDB está abierta');
    });

    this.logConnectionDetails();
  }

  private logConnectionDetails() {
    setTimeout(() => {
      console.log('\n--- Detalles de la conexión MongoDB ---');
      console.log('Estado:', this.connection.readyState);
      console.log('Base de datos:', this.connection.db?.databaseName || 'No disponible');
      console.log('Host:', this.connection.host || 'No disponible');
      console.log('Puerto:', this.connection.port || 'No disponible');
      console.log('Nombre de la conexión:', this.connection.name || 'default');
      console.log('----------------------------------------\n');
    }, 100); 
  }


  isConnected(): boolean {
    return this.connection.readyState === 1;
  }

  getDatabaseInfo() {
    return {
      isConnected: this.isConnected(),
      state: this.connection.readyState,
      database: this.connection.db?.databaseName,
      host: this.connection.host,
      port: this.connection.port
    };
  }
}