import React, { useState, useEffect, useCallback } from 'react';
import { Layout, message, Modal, Dropdown, Button, Space, Typography, Select } from 'antd';
import { MoreOutlined, UserAddOutlined, UserDeleteOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { Role } from '@/src/auth/types';
import { chatService } from '@/src/features/chat/services/chatService';
import { ChatAttachment, ChatGroup, ChatMessage } from '@/src/features/chat/types';
import ChatSidebar from './components/ChatSidebar';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import CreateGroupModal from './components/CreateGroupModal';
import GroupMembersModal from './components/GroupMembersModal';
import { mockUsers } from '@/src/auth/mockUsers';

const { Content, Sider } = Layout;

const ChatPage: React.FC = () => {
    const { user } = useAuth();
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
    
    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const [groups, setGroups] = useState<ChatGroup[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

    const isAdmin = user?.role === Role.DIRECTOR || user?.role === Role.ACCOUNTANT;

    const loadGroups = useCallback(() => {
        if (user) {
            setGroups(chatService.getGroups(user.id));
        }
    }, [user]);

    useEffect(() => {
        loadGroups();
        
        const handleNewMessage = (msg: ChatMessage) => {
            if (msg.groupId === selectedGroupId) {
                setMessages(prev => [...prev, msg]);
            }
            loadGroups(); // Update last message in sidebar
        };

        const handleGroupUpdate = () => {
            loadGroups();
        };

        const handleMemberRemoved = ({ groupId, memberId }: { groupId: string, memberId: string }) => {
            if (memberId === user?.id) {
                if (selectedGroupId === groupId) {
                    setSelectedGroupId(undefined);
                    setMessages([]);
                }
                loadGroups();
                message.warning('Bạn đã bị xóa khỏi nhóm chat');
            } else {
                if (selectedGroupId === groupId) {
                    loadGroups(); // Refresh member count etc
                }
            }
        };

        chatService.on('new_message', handleNewMessage);
        chatService.on('group_created', handleGroupUpdate);
        chatService.on('member_added', handleGroupUpdate);
        chatService.on('member_removed', handleMemberRemoved);
        chatService.on('group_deleted', (deletedId) => {
            if (selectedGroupId === deletedId) {
                setSelectedGroupId(undefined);
                setMessages([]);
                message.info('Nhóm chat này đã bị xóa');
            }
            loadGroups();
        });

        return () => {
            chatService.off('new_message', handleNewMessage);
            chatService.off('group_created', handleGroupUpdate);
            chatService.off('member_added', handleGroupUpdate);
            chatService.off('member_removed', handleMemberRemoved);
        };
    }, [user, selectedGroupId, loadGroups]);

    useEffect(() => {
        if (selectedGroupId) {
            setMessages(chatService.getMessages(selectedGroupId));
        }
    }, [selectedGroupId]);

    const handleSendMessage = (content: string, attachments?: ChatAttachment[]) => {
        if (selectedGroupId && user) {
            chatService.sendMessage(selectedGroupId, user.id, user.name, content, attachments);
        }
    };

    const handleCreateGroup = (name: string, members: string[]) => {
        if (user) {
            const newGroup = chatService.createGroup(name, members, user.id);
            setSelectedGroupId(newGroup.id);
            setIsCreateModalOpen(false);
            message.success(`Đã tạo nhóm "${name}"`);
        }
    };

    const handleAddMember = (memberId: string) => {
        if (selectedGroupId) {
            chatService.addMember(selectedGroupId, memberId);
            message.success('Đã thêm thành viên');
        }
    };

    const handleRemoveMember = (memberId: string) => {
        if (selectedGroupId) {
            chatService.removeMember(selectedGroupId, memberId);
            message.success('Đã xóa thành viên');
        }
    };

    const handleDeleteGroup = (groupId: string) => {
        chatService.deleteGroup(groupId);
        setIsMembersModalOpen(false);
        message.success('Đã xóa nhóm chat');
    };

    const selectedGroup = groups.find(g => g.id === selectedGroupId);

    return (
        <Layout style={{ height: 'calc(100vh - 150px)', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
            {/* Desktop: show sidebar always. Mobile: show sidebar only when no group selected */}
            <Sider
              width={300}
              theme="light"
              breakpoint="md"
              collapsedWidth={0}
              trigger={null}
              collapsed={!!selectedGroupId && isMobile}
              style={{
                display: selectedGroupId && isMobile ? 'none' : 'block',
              }}
            >
                <ChatSidebar 
                    groups={groups} 
                    selectedGroupId={selectedGroupId}
                    onSelectGroup={setSelectedGroupId}
                    onCreateGroup={() => setIsCreateModalOpen(true)}
                />
            </Sider>
            <Layout style={{ display: !selectedGroupId && isMobile ? 'none' : 'flex' }}>
                {selectedGroup ? (
                    <>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Button
                                  type="text"
                                  size="small"
                                  className="md-hidden"
                                  onClick={() => setSelectedGroupId(undefined)}
                                  style={{ padding: '0 4px' }}
                                >
                                  ← 
                                </Button>
                                <div>
                                  <Typography.Title level={5} style={{ margin: 0 }}>{selectedGroup.name}</Typography.Title>
                                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                      {selectedGroup.members.length} thành viên
                                  </Typography.Text>
                                </div>
                            </div>
                            <Button 
                                type="text" 
                                icon={<MoreOutlined style={{ color: '#000', fontSize: '20px', fontWeight: 'bold' }} />} 
                                onClick={() => setIsMembersModalOpen(true)}
                            />
                        </div>
                        <ChatMessages messages={messages} />
                        <ChatInput onSendMessage={handleSendMessage} />
                    </>
                ) : (
                    <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                        <Typography.Text type="secondary">Chọn một nhóm chat để bắt đầu trò chuyện</Typography.Text>
                    </Content>
                )}
            </Layout>

            <CreateGroupModal 
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateGroup}
            />
            <GroupMembersModal
                open={isMembersModalOpen}
                onCancel={() => setIsMembersModalOpen(false)}
                group={selectedGroup}
                allUsers={mockUsers}
                currentUser={user}
                isAdmin={isAdmin}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMember}
                onDeleteGroup={handleDeleteGroup}
            />
        </Layout>
    );
};

export default ChatPage;
