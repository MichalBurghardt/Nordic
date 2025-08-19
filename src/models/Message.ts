import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IMessage extends Document {
  sender: IUser['_id'];
  recipient: IUser['_id'];
  content: string;
  messageType: 'text' | 'file';
  isRead: boolean;
  readAt?: Date;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required'],
    index: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required'],
    index: true,
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'file'],
    default: 'text',
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  readAt: {
    type: Date,
  },
  attachments: [{
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
  }],
}, {
  timestamps: true,
});

// Indeksy dla lepszej wydajności
MessageSchema.index({ sender: 1, recipient: 1 });
MessageSchema.index({ recipient: 1, isRead: 1 });
MessageSchema.index({ createdAt: -1 });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
