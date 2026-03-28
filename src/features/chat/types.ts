import { Role } from '@/src/auth/types';

export interface ChatMember {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: string; // MIME type, e.g. 'image/png'
  url: string;  // base64 data URL
  size: number; // bytes
}

export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  attachments?: string[] | ChatAttachment[];
  status?: 'sending' | 'sent' | 'error';
}

export interface ChatGroup {
  id: string;
  name: string;
  members: string[]; // Member IDs
  lastMessage?: ChatMessage;
  createdAt: string;
  createdBy: string;
  createdByName?: string;
  unreadCount?: number;
}
