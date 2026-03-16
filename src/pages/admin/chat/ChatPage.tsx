import React, { useState, useEffect, useCallback } from 'react';
import { Layout, message, Modal, Dropdown, Button, Space, Typography, Select } from 'antd';
import { MoreOutlined, UserAddOutlined, UserDeleteOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { Role } from '@/src/auth/types';
import { chatService } from '@/src/features/chat/services/chatService';
import { ChatGroup, ChatMessage } from '@/src/features/chat/types';
import ChatSidebar from './components/ChatSidebar';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import CreateGroupModal from './components/CreateGroupModal';
import { mockUsers } from '@/src/auth/mockUsers';

const { Content, Sider } = Layout;

const ChatPage: React.FC = () => {
    const { user } = useAuth();
    const [groups, setGroups] = useState<ChatGroup[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

    const handleSendMessage = (content: string) => {
        if (selectedGroupId && user) {
            chatService.sendMessage(selectedGroupId, user.id, user.name, content);
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
        Modal.confirm({
            title: 'Xóa nhóm chat',
            content: 'Bạn có chắc chắn muốn xóa nhóm chat này không? Tất cả tin nhắn sẽ bị mất.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: () => {
                chatService.deleteGroup(groupId);
                message.success('Đã xóa nhóm chat');
            },
        });
    };

    const selectedGroup = groups.find(g => g.id === selectedGroupId);

    const groupMenu = (
        <Dropdown
            menu={{
                items: [
                    {
                        key: 'add_member',
                        label: 'Thêm thành viên',
                        icon: <UserAddOutlined />,
                        onClick: () => {
                            const nonMembers = mockUsers.filter(u => !selectedGroup?.members.includes(u.id));
                            if (nonMembers.length === 0) {
                                message.info('Tất cả nhân viên đã có trong nhóm');
                                return;
                            }
                            Modal.confirm({
                                title: 'Thêm thành viên',
                                content: (
                                    <Select 
                                        style={{ width: '100%' }} 
                                        placeholder="Chọn nhân viên"
                                        options={nonMembers.map(u => ({ label: u.name, value: u.id }))}
                                        onChange={(val) => (Modal as any)._selectedMember = val}
                                    />
                                ),
                                onOk: () => {
                                    const val = (Modal as any)._selectedMember;
                                    if (val) handleAddMember(val);
                                }
                            });
                        },
                    },
                    {
                        key: 'remove_member',
                        label: 'Gỡ thành viên',
                        icon: <UserDeleteOutlined />,
                        onClick: () => {
                            const members = mockUsers.filter(u => selectedGroup?.members.includes(u.id) && u.id !== user?.id);
                            if (members.length === 0) {
                                message.info('Không có thành viên nào khác để gỡ');
                                return;
                            }
                            Modal.confirm({
                                title: 'Gỡ thành viên',
                                content: (
                                    <Select 
                                        style={{ width: '100%' }} 
                                        placeholder="Chọn thành viên"
                                        options={members.map(u => ({ label: u.name, value: u.id }))}
                                        onChange={(val) => (Modal as any)._selectedMember = val}
                                    />
                                ),
                                onOk: () => {
                                    const val = (Modal as any)._selectedMember;
                                    if (val) handleRemoveMember(val);
                                }
                            });
                        },
                    },
                    { type: 'divider' },
                    {
                        key: 'delete',
                        label: 'Xóa nhóm',
                        icon: <DeleteOutlined />,
                        danger: true,
                        onClick: () => selectedGroupId && handleDeleteGroup(selectedGroupId),
                    },
                ],
            }}
            trigger={['click']}
        >
            <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
    );

    return (
        <Layout style={{ height: 'calc(100vh - 150px)', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
            <Sider width={300} theme="light">
                <ChatSidebar 
                    groups={groups} 
                    selectedGroupId={selectedGroupId}
                    onSelectGroup={setSelectedGroupId}
                    onCreateGroup={() => setIsCreateModalOpen(true)}
                />
            </Sider>
            <Layout>
                {selectedGroup ? (
                    <>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Typography.Title level={5} style={{ margin: 0 }}>{selectedGroup.name}</Typography.Title>
                                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                    {selectedGroup.members.length} thành viên
                                </Typography.Text>
                            </div>
                            {isAdmin && groupMenu}
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
        </Layout>
    );
};

export default ChatPage;
