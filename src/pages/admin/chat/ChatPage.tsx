import React, { useState, useEffect, useCallback } from 'react';
import { message, Modal } from 'antd';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { Role } from '@/src/auth/types';
import { socket } from '@/src/api/socket';
import { useChatGroupService, useUserService, useChatMessageService } from '@/src/api/services';
import { ChatGroup, ChatMessage } from '@/src/features/chat/types';
import ChatSidebar from './components/ChatSidebar';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import CreateGroupModal from './components/CreateGroupModal';
import GroupMembersModal from './components/GroupMembersModal';
import { User } from '@/src/auth/types';


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
                    attachments: msg.attachments || [],
                };

                setMessages(prev => {
                    // Update optimistic message if exists
                    const existingMsgIndex = prev.findIndex(m => m.id === msg.messageId);
                    if (existingMsgIndex >= 0) {
                        const newMsgs = [...prev];
                        newMsgs[existingMsgIndex] = { 
                            ...newMsgs[existingMsgIndex], 
                            ...mappedMsg, // Merge server response including attachments
                            status: 'sent' as any 
                        };
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
                    const msgData = res?.data || res;
                    if (msgData && (msgData.id || msgData._id)) {
                        setMessages(prev => prev.map(m => m.id === tempMessageId ? { 
                            ...m, 
                            id: msgData.id || msgData._id, 
                            status: 'sent',
                            attachments: msgData.attachments || [] 
                        } : m));
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

    const avatarColors = [
        '#6366f1',
        '#ec4899',
        '#0ea5e9',
        '#14b8a6',
        '#f59e0b',
    ];
    const getAvatarGradient = (name: string) => {
        const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
        return avatarColors[code % avatarColors.length];
    };
    const getInitials = (name: string) =>
        name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

    return (
        <div style={{
            height: 'calc(100vh - 148px)',
            display: 'flex',
            borderRadius: 12,
            overflow: 'hidden',
            background: '#f8f9fb',
            border: '1px solid #e8ecf0',
        }}>
            {/* Sidebar */}
            <div style={{
                width: isMobile ? (selectedGroupId ? 0 : '100%') : 280,
                minWidth: isMobile ? (selectedGroupId ? 0 : '100%') : 280,
                display: isMobile && selectedGroupId ? 'none' : 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'width 0.3s',
            }}>
                <ChatSidebar
                    groups={groups}
                    selectedGroupId={selectedGroupId}
                    onSelectGroup={handleSelectGroup}
                    onCreateGroup={() => setIsCreateModalOpen(true)}
                />
            </div>

            {/* Main Content */}
            <div style={{
                flex: 1,
                display: isMobile && !selectedGroupId ? 'none' : 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
            }}>
                {selectedGroup ? (
                    <>
                        {/* Chat Header */}
                        <div style={{
                            padding: '12px 20px',
                            background: '#fff',
                            borderBottom: '1px solid #e8ecf0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {isMobile && (
                                    <button
                                        onClick={() => setSelectedGroupId(undefined)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: '#64748b', fontSize: 20, padding: '0 4px',
                                        }}
                                    >←</button>
                                )}
                                <div style={{
                                    width: 40, height: 40, borderRadius: 12,
                                    background: getAvatarGradient(selectedGroup.name),
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: 14, color: '#fff',
                                }}>
                                    {getInitials(selectedGroup.name)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>
                                        {selectedGroup.name}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>
                                        {selectedGroup.members.length} thành viên
                                        {selectedGroup.createdByName ? ` · Tạo bởi ${selectedGroup.createdByName}` : ''}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsMembersModalOpen(true)}
                                title="Quản lý nhóm"
                                style={{
                                    width: 36, height: 36,
                                    borderRadius: 10,
                                    background: 'rgba(0,0,0,0.04)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#64748b',
                                    fontSize: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.07)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                            >
                                ⋯
                            </button>
                        </div>

                        {/* Messages */}
                        <ChatMessages
                            messages={messages}
                            onDeleteMessage={handleDeleteMessage}
                            onEditMessage={handleEditMessage}
                        />

                        {/* Input */}
                        <ChatInput onSendMessage={handleSendMessage} />
                    </>
                ) : (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f8f9fb',
                        gap: 16,
                    }}>
                        <div style={{ fontSize: 56 }}>💬</div>
                        <div style={{ color: '#94a3b8', fontSize: 15 }}>Chọn nhóm để bắt đầu trò chuyện</div>
                    </div>
                )}
            </div>

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
        </div>
    );
};

export default ChatPage;

