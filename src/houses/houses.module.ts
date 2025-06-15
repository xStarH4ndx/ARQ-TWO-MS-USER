import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HousesService } from './houses.service';
import { HousesController } from './houses.controller';
import { Houses, HousesSchema } from './entities/house.entity';
import { HousesListener } from './houses.listener';

@Module({
  imports: [MongooseModule.forFeature([{ name: Houses.name, schema: HousesSchema }])],
  controllers: [HousesController],
  providers: [HousesService, HousesListener],
  exports: [HousesService],
})
export class HousesModule {}