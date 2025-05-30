// entities/user.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class User {
  @Prop({ 
    type: Types.ObjectId, 
    required: true, 
    unique: true,
    index: true,
    ref: 'Auth' 
  })
  authId: Types.ObjectId;

  @Prop({ 
    required: true, 
    trim: true,
    minLength: 2,
    maxLength: 50
  })
  firstName: string;

  @Prop({ 
    required: true, 
    trim: true,
    minLength: 2,
    maxLength: 50
  })
  lastName: string;

  @Prop({ 
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  })
  email: string;

  @Prop({ 
    default: true 
  })
  isActive: boolean;

  @Prop({ 
    default: Date.now 
  })
  lastLogin?: Date;


  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);