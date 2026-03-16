import { Role } from '@/src/auth/types';

export interface ChatMember {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  members: string[]; // Member IDs
  lastMessage?: ChatMessage;
  createdAt: string;
  createdBy: string;
}
