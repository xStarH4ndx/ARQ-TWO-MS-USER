import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { HousesService } from './houses.service';

interface MessageDTO {
  data: {
    action: string;
    body: any;
  };
}

@Controller()
export class HousesListener {
  private readonly logger = new Logger(HousesListener.name);

  constructor(private readonly houseService: HousesService) {}

  @MessagePattern('cuotaPago.queue')
  async handleHouseQueue(@Payload() message: MessageDTO) {
    try {
      const { data } = message;

      if (!data || !data.action || !data.body) {
        this.logger.warn('Mensaje recibido con estructura inválida');
        return null;
      }

      const { action, body } = data;

      switch (action) {
        case 'getHouseById':
          const casaId = body?.casaId;
          if (!casaId) {
            this.logger.warn('Falta el campo houseId en body');
            return null;
          }

          const house = await this.houseService.findOne(casaId);
          this.logger.log(`Casa encontrada: ${JSON.stringify(house)}`);
          return house;
          
        default:
          this.logger.warn(`Acción no reconocida: ${action}`);
          return null;
      }
    } catch (error) {
      this.logger.error(`Error al manejar mensaje de RabbitMQ: ${error.message}`);
      return null;
    }
  }
}
