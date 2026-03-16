import { ChatGroup, ChatMessage } from '../types';
import { mockUsers } from '@/src/auth/mockUsers';

type ChatEvent = 'new_message' | 'member_added' | 'member_removed' | 'group_deleted' | 'group_created';
type ChatHandler = (data: any) => void;

class ChatService {
  private handlers: Map<ChatEvent, Set<ChatHandler>> = new Map();
  private groups: ChatGroup[] = [];
  private messages: Record<string, ChatMessage[]> = {}; // groupId -> messages

  constructor() {
    this.loadData();
  }

  private loadData() {
    const storedGroups = localStorage.getItem('chat_groups');
    const storedMessages = localStorage.getItem('chat_messages');
    
    if (storedGroups) {
      this.groups = JSON.parse(storedGroups);
    } else {
      // Initial mock groups
      this.groups = [
        {
          id: 'g1',
          name: 'Ban Giám Đốc',
          members: ['1', '2'],
          createdAt: new Date().toISOString(),
          createdBy: '1',
        },
        {
          id: 'g2',
          name: 'Dự án Vinhome',
          members: ['1', '2', '4', '5'],
          createdAt: new Date().toISOString(),
          createdBy: '1',
        }
      ];
      this.saveGroups();
    }

    if (storedMessages) {
      this.messages = JSON.parse(storedMessages);
    } else {
      this.messages = {
        'g1': [
          { id: 'm1', groupId: 'g1', senderId: '1', senderName: 'Nguyễn Giám Đốc', content: 'Chào mọi người, chúng ta bắt đầu họp.', timestamp: new Date().toISOString() }
        ],
        'g2': [
          { id: 'm2', groupId: 'g2', senderId: '4', senderName: 'Phạm Nhân Viên', content: 'Tôi đã cập nhật tiến độ dự án.', timestamp: new Date().toISOString() }
        ]
      };
      this.saveMessages();
    }
  }

  private saveGroups() {
    localStorage.setItem('chat_groups', JSON.stringify(this.groups));
  }

  private saveMessages() {
    localStorage.setItem('chat_messages', JSON.stringify(this.messages));
  }

  on(event: ChatEvent, handler: ChatHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)?.add(handler);
  }

  off(event: ChatEvent, handler: ChatHandler) {
    this.handlers.get(event)?.delete(handler);
  }

  private emit(event: ChatEvent, data: any) {
    this.handlers.get(event)?.forEach(handler => handler(data));
  }

  getGroups(userId: string): ChatGroup[] {
    return this.groups.filter(g => g.members.includes(userId));
  }

  getMessages(groupId: string): ChatMessage[] {
    return this.messages[groupId] || [];
  }

  sendMessage(groupId: string, senderId: string, senderName: string, content: string) {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      groupId,
      senderId,
      senderName,
      content,
      timestamp: new Date().toISOString(),
    };

    if (!this.messages[groupId]) {
      this.messages[groupId] = [];
    }
    this.messages[groupId].push(newMessage);
    this.saveMessages();
    
    // Update last message in group
    const group = this.groups.find(g => g.id === groupId);
    if (group) {
        group.lastMessage = newMessage;
        this.saveGroups();
    }

    this.emit('new_message', newMessage);
    return newMessage;
  }

  createGroup(name: string, members: string[], createdBy: string) {
    const newGroup: ChatGroup = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      members: Array.from(new Set([...members, createdBy])),
      createdAt: new Date().toISOString(),
      createdBy,
    };

    this.groups.push(newGroup);
    this.saveGroups();
    this.emit('group_created', newGroup);
    return newGroup;
  }

  addMember(groupId: string, memberId: string) {
      const group = this.groups.find(g => g.id === groupId);
      if (group && !group.members.includes(memberId)) {
          group.members.push(memberId);
          this.saveGroups();
          this.emit('member_added', { groupId, memberId });
      }
  }

  removeMember(groupId: string, memberId: string) {
      const group = this.groups.find(g => g.id === groupId);
      if (group) {
          group.members = group.members.filter(id => id !== memberId);
          this.saveGroups();
          this.emit('member_removed', { groupId, memberId });
      }
  }

  deleteGroup(groupId: string) {
      this.groups = this.groups.filter(g => g.id !== groupId);
      delete this.messages[groupId];
      this.saveGroups();
      this.saveMessages();
      this.emit('group_deleted', groupId);
  }
}

export const chatService = new ChatService();
