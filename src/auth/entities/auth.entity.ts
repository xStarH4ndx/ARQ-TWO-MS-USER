import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthDocument = Auth & Document;

@Schema({ timestamps: true })
export class Auth {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  resetToken?: string;

  @Prop({ type: Date })
  resetTokenExpiration?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);