import React, { useState, useEffect, useCallback } from 'react';
import { Layout, message, Modal, Dropdown, Button, Space, Typography, Select } from 'antd';
import { MoreOutlined, UserAddOutlined, UserDeleteOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { Role } from '@/src/auth/types';
import { socket } from '@/src/api/socket';
import { useChatGroupService, useUserService, useChatMessageService } from '@/src/api/services';
import { ChatAttachment, ChatGroup, ChatMessage } from '@/src/features/chat/types';
import ChatSidebar from './components/ChatSidebar';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import CreateGroupModal from './components/CreateGroupModal';
import GroupMembersModal from './components/GroupMembersModal';
import { User } from '@/src/auth/types';

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
    const [allUsers, setAllUsers] = useState<User[]>([]);

    const isAdmin = user?.role === Role.DIRECTOR || user?.role === Role.ACCOUNTANT;
    const { request, create, patch, remove } = useChatGroupService();
    const { request: requestUsers } = useUserService();
    const { patch: patchMessage, remove: removeMessage } = useChatMessageService();

    const loadUsers = useCallback(async () => {
        if (!isAdmin) return;
        try {
            const res = await requestUsers('GET', '', null, { limit: 1000 });
            if (res.data) setAllUsers(res.data);
        } catch (e) {
            console.error("Failed to load users", e);
        }
    }, [requestUsers, isAdmin]);

    const loadGroups = useCallback(async () => {
        if (user) {
            try {
                const res = await request('GET', '');
                if (res.data) {
                    const mappedGroups = res.data.map((g: any) => ({
                        ...g,
                        id: g.id || g._id,
                        members: (g.members || g.memberIds || []).map((m: any) => typeof m === 'object' ? (m.id || m._id) : m),
                        createdByName: g.createdById?.name || g.createdBy?.name || 'Ẩn danh',
                        createdBy: g.createdById?.id || g.createdBy?.id || g.createdBy || '',
                    }));
                    setGroups(mappedGroups);
                }
            } catch (e) {
                console.error("Failed to load chat groups", e);
            }
        }
    }, [user, request]);

    useEffect(() => {
        loadUsers();
        loadGroups();

        const handleNewMessage = (msg: any) => {
            if (msg.roomId === selectedGroupId || msg.groupId === selectedGroupId) {
                const mappedMsg: ChatMessage = {
                    id: (msg.messageId || msg._id || Math.random().toString()) as string,
                    groupId: (msg.roomId || msg.groupId) as string,
                    senderId: (msg.userId || msg.senderId) as string,
                    senderName: (msg.userName || msg.senderName) as string,
                    content: (msg.message || msg.content) as string,
                    timestamp: (msg.timestamp || new Date().toISOString()) as string,
                };
                
                setMessages(prev => {
                    // Update optimistic message if exists
                    const existingMsgIndex = prev.findIndex(m => m.id === msg.messageId);
                    if (existingMsgIndex >= 0) {
                        const newMsgs = [...prev];
                        newMsgs[existingMsgIndex] = { ...newMsgs[existingMsgIndex], status: 'sent' as any };
                        return newMsgs;
                    }
                    return [...prev, mappedMsg];
                });
            }
            loadGroups(); // Update last message in sidebar
        };

        const handleGroupUpdate = () => {
            loadGroups();
        };

        const handleMessageError = (error: any) => {
            setMessages(prev => prev.map(m => m.id === error.messageId ? { ...m, status: 'error' as any } : m));
            message.error('Gửi tin nhắn thất bại');
        };

        socket.on('chat:message', handleNewMessage);
        socket.on('chat:message-error', handleMessageError);
        
        socket.on('group_created', handleGroupUpdate);
        socket.on('member_added', handleGroupUpdate);
        socket.on('group_deleted', (deletedId) => {
            if (selectedGroupId === deletedId) {
                setSelectedGroupId(undefined);
                setMessages([]);
                message.info('Nhóm chat này đã bị xóa');
            }
            loadGroups();
        });

        return () => {
            socket.off('chat:message', handleNewMessage);
            socket.off('chat:message-error', handleMessageError);
            socket.off('group_created', handleGroupUpdate);
            socket.off('member_added', handleGroupUpdate);
            socket.off('group_deleted');
        };
    }, [user, selectedGroupId, loadGroups]);

    const loadMessages = useCallback(async (groupId: string) => {
        try {
            const res = await request('GET', `/${groupId}/messages`);
            if (res.data) {
                setMessages(res.data);
            }
        } catch (e) {
            console.error("Failed to load messages", e);
        }
    }, [request]);

    useEffect(() => {
        if (selectedGroupId) {
            socket.emit('chat:join', { roomId: selectedGroupId });
            loadMessages(selectedGroupId);

            return () => {
                socket.emit('chat:leave', { roomId: selectedGroupId });
            };
        }
    }, [selectedGroupId, loadMessages]);

    const handleSendMessage = async (content: string, files?: File[]) => {
        if (selectedGroupId && user) {
            const hasFiles = files && files.length > 0;
            const tempMessageId = `temp-${Date.now()}-${Math.random()}`;
            
            const optimisticMsg: ChatMessage = {
                id: tempMessageId,
                groupId: selectedGroupId,
                senderId: user.id || (user as any)._id,
                senderName: user.name,
                content: content,
                timestamp: new Date().toISOString(),
                status: 'sending'
            };

            if (!hasFiles) {
                setMessages(prev => [...prev, optimisticMsg]);
                socket.emit('chat:message', {
                    roomId: selectedGroupId,
                    message: content,
                    messageId: tempMessageId
                });
            } else {
                try {
                    setMessages(prev => [...prev, optimisticMsg]);
                    const formData = new FormData();
                    formData.append('content', content);
                    files.forEach((file) => {
                        formData.append('attachments', file);
                    });
                    const res = await request('POST', `/${selectedGroupId}/messages`, formData);
                    if (res && (res.id || (res as any)._id)) {
                       setMessages(prev => prev.map(m => m.id === tempMessageId ? { ...m, id: res.id || (res as any)._id, status: 'sent' } : m));
                    }
                } catch (e) {
                    message.error('Lỗi khi gửi tin nhắn đính kèm');
                    setMessages(prev => prev.map(m => m.id === tempMessageId ? { ...m, status: 'error' } : m));
                }
            }
        }
    };

    const handleDeleteMessage = async (msgId: string) => {
        try {
            await removeMessage(msgId);
            if (selectedGroupId) loadMessages(selectedGroupId);
        } catch (e) {
            message.error('Lỗi xóa tin nhắn');
        }
    };

    const handleEditMessage = async (msgId: string, newContent: string) => {
        try {
            await patchMessage(msgId, { content: newContent });
            if (selectedGroupId) loadMessages(selectedGroupId);
        } catch (e) {
            message.error('Lỗi cập nhật tin nhắn');
        }
    };

    const handleCreateGroup = async (name: string, members: string[]) => {
        if (user) {
            try {
                const res = await create({ name, memberIds: members });
                if (res) {
                    setIsCreateModalOpen(false);
                    loadGroups();
                    if (res.id || (res as any)._id) {
                        setSelectedGroupId(res.id || (res as any)._id);
                    }
                }
            } catch (e) {
                message.error('Có lỗi xảy ra khi tạo nhóm chat');
            }
        }
    };

    const handleAddMembers = async (memberIds: string[]) => {
        if (selectedGroup) {
            const newMemberIds = Array.from(new Set([...selectedGroup.members, ...memberIds]));
            try {
                await patch(selectedGroup.id, { memberIds: newMemberIds });
                loadGroups();
            } catch (e) {
                message.error('Có lỗi xảy ra khi thêm thành viên');
            }
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (selectedGroup) {
            const newMemberIds = selectedGroup.members.filter(id => id !== memberId);
            try {
                await patch(selectedGroup.id, { memberIds: newMemberIds });
                loadGroups();
            } catch (e) {
                message.error('Có lỗi xảy ra khi xóa thành viên');
            }
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        try {
            await remove(groupId);
            setIsMembersModalOpen(false);
            setSelectedGroupId(undefined);
            loadGroups();
        } catch (e) {
            message.error('Có lỗi xảy ra khi xóa nhóm');
        }
    };

    const handleSelectGroup = async (groupId: string) => {
        setSelectedGroupId(groupId);
        const group = groups.find(g => g.id === groupId);
        if (group && group.unreadCount && group.unreadCount > 0) {
            try {
                await request('POST', `/${groupId}/read`);
                setGroups(prev => prev.map(g => g.id === groupId ? { ...g, unreadCount: 0 } : g));
            } catch (error) {
                console.error('Failed to mark group as read', error);
            }
        }
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
                    onSelectGroup={handleSelectGroup}
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
                                        {selectedGroup.members.length} thành viên {selectedGroup.createdByName ? `• Tạo bởi: ${selectedGroup.createdByName}` : ''}
                                    </Typography.Text>
                                </div>
                            </div>
                            <Button
                                type="text"
                                icon={<MoreOutlined style={{ color: '#000', fontSize: '20px', fontWeight: 'bold' }} />}
                                onClick={() => setIsMembersModalOpen(true)}
                            />
                        </div>
                        <ChatMessages 
                            messages={messages} 
                            onDeleteMessage={handleDeleteMessage}
                            onEditMessage={handleEditMessage}
                        />
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
                allUsers={allUsers}
            />
            <GroupMembersModal
                open={isMembersModalOpen}
                onCancel={() => setIsMembersModalOpen(false)}
                group={selectedGroup}
                allUsers={allUsers}
                currentUser={user}
                isAdmin={isAdmin}
                onAddMembers={handleAddMembers}
                onRemoveMember={handleRemoveMember}
                onDeleteGroup={handleDeleteGroup}
            />
        </Layout>
    );
};

export default ChatPage;
