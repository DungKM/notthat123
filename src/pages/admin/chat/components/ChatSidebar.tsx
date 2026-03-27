import React from 'react';
import { List, Avatar, Button, Typography, Badge } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ChatGroup } from '@/src/features/chat/types';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { Role } from '@/src/auth/types';

const { Text } = Typography;

interface ChatSidebarProps {
    groups: ChatGroup[];
    selectedGroupId?: string;
    onSelectGroup: (groupId: string) => void;
    onCreateGroup: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
    groups,
    selectedGroupId,
    onSelectGroup,
    onCreateGroup,
}) => {
    const { user } = useAuth();
    const canCreateGroup = user?.role === Role.DIRECTOR || user?.role === Role.ACCOUNTANT;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid #f0f0f0' }}>
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
                <Typography.Title level={4} style={{ margin: 0 }}>Nhóm Chat</Typography.Title>
                {canCreateGroup && (
                    <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={onCreateGroup} />
                )}
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <List
                    dataSource={groups}
                    renderItem={(item) => (
                        <List.Item
                            onClick={() => onSelectGroup(item.id)}
                            style={{
                                cursor: 'pointer',
                                padding: '12px 16px',
                                backgroundColor: selectedGroupId === item.id ? '#e6f7ff' : 'transparent',
                                transition: 'background-color 0.3s',
                            }}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Badge count={item.unreadCount || 0} size="small" offset={[-2, 6]}>
                                        <Avatar src={`https://api.dicebear.com/7.x/initials/svg?seed=${item.name}`} />
                                    </Badge>
                                }
                                title={<Text strong>{item.name}</Text>}
                                description={
                                    <Text type="secondary" ellipsis style={{ maxWidth: '200px' }}>
                                        {item.lastMessage ? `${item.lastMessage.senderName}: ${item.lastMessage.content}` : 'Chưa có tin nhắn'}
                                    </Text>
                                }
                            />
                        </List.Item>
                    )}
                />
            </div>
        </div>
    );
};

export default ChatSidebar;
