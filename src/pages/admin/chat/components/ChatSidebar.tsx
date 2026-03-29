import React from 'react';
import { ChatGroup } from '@/src/features/chat/types';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { Role } from '@/src/auth/types';
import dayjs from 'dayjs';

interface ChatSidebarProps {
    groups: ChatGroup[];
    selectedGroupId?: string;
    onSelectGroup: (groupId: string) => void;
    onCreateGroup: () => void;
}

const avatarColors = [
    '#6366f1',
    '#ec4899',
    '#0ea5e9',
    '#14b8a6',
    '#f59e0b',
    '#10b981',
];

const getAvatarGradient = (name: string) => {
    const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
    return avatarColors[code % avatarColors.length];
};

const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const ChatSidebar: React.FC<ChatSidebarProps> = ({
    groups,
    selectedGroupId,
    onSelectGroup,
    onCreateGroup,
}) => {
    const { user } = useAuth();
    const canCreateGroup = user?.role === Role.DIRECTOR || user?.role === Role.ACCOUNTANT;

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#f8f9fb',
            color: '#1e293b',
            borderRight: '1px solid #e8ecf0',
        }}>
            {/* Header */}
            <div style={{
                padding: '18px 16px 14px',
                borderBottom: '1px solid #e8ecf0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fff',
            }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>💬 Nhóm Chat</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{groups.length} nhóm</div>
                </div>
                {canCreateGroup && (
                    <button
                        onClick={onCreateGroup}
                        title="Tạo nhóm mới"
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: '#6366f1',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#fff',
                            fontSize: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'opacity 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                        +
                    </button>
                )}
            </div>

            {/* Group List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
                {groups.length === 0 ? (
                    <div style={{
                        padding: '40px 16px',
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: 13,
                    }}>
                        Chưa có nhóm nào
                    </div>
                ) : groups.map(group => {
                    const isActive = group.id === selectedGroupId;
                    const hasUnread = (group.unreadCount || 0) > 0;
                    const lastMsg = group.lastMessage;
                    const time = lastMsg?.timestamp ? dayjs(lastMsg.timestamp).format('HH:mm') : '';

                    return (
                        <div
                            key={group.id}
                            onClick={() => onSelectGroup(group.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '10px 16px',
                                cursor: 'pointer',
                                background: isActive ? '#ede9fe' : 'transparent',
                                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => {
                                if (!isActive) (e.currentTarget as HTMLDivElement).style.background = '#f1f5f9';
                            }}
                            onMouseLeave={e => {
                                if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                            }}
                        >
                            {/* Avatar */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 12,
                                    background: getAvatarGradient(group.name),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: 15,
                                    color: '#fff',
                                }}>
                                    {getInitials(group.name)}
                                </div>
                                {hasUnread && (
                                    <div style={{
                                        position: 'absolute',
                                        top: -4,
                                        right: -4,
                                        minWidth: 18,
                                        height: 18,
                                        borderRadius: 9,
                                        background: '#ef4444',
                                        color: '#fff',
                                        fontSize: 10,
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0 4px',
                                        border: '2px solid #f8f9fb',
                                    }}>
                                        {group.unreadCount}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 2,
                                }}>
                                    <span style={{
                                        fontWeight: hasUnread ? 700 : 500,
                                        fontSize: 13.5,
                                        color: isActive ? '#4f46e5' : '#1e293b',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: 130,
                                    }}>
                                        {group.name}
                                    </span>
                                    <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{time}</span>
                                </div>
                                <div style={{
                                    fontSize: 12,
                                    color: '#94a3b8',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {lastMsg
                                        ? `${lastMsg.senderName}: ${lastMsg.content}`
                                        : 'Chưa có tin nhắn'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatSidebar;
