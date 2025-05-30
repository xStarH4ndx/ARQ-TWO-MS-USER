import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HousesDocument = Houses & Document;

@Schema({ timestamps: true })
export class Houses {
    @Prop({ required: true, maxlength: 100 })
    nombre: string;

    @Prop({ required: true, maxlength: 100 })
    descripcion: string;

    @Prop({ required: true })
    codigo: string;

    @Prop({ type: [String], default: [] })
    userIds: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const HousesSchema = SchemaFactory.createForClass(Houses);
