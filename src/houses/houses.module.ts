import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HousesService } from './houses.service';
import { HousesController } from './houses.controller';
import { Houses, HousesSchema } from './entities/house.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Houses.name, schema: HousesSchema }])],
  controllers: [HousesController],
  providers: [HousesService],
  exports: [HousesService],
})
export class HousesModule {}