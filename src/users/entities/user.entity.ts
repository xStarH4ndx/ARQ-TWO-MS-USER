import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, maxlength: 100 })
  nombre: string;

  @Prop({ required: true, maxlength: 100 })
  apellido: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  access_token?: string;

  @Prop()
  refresh_token?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function(next) {
  const user = this as UserDocument;
  
  if (!user.isModified('password')) return next();
  
  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate() as any;
  
  if (update.password) {
    try {
      const saltRounds = 12;
      update.password = await bcrypt.hash(update.password, saltRounds);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};