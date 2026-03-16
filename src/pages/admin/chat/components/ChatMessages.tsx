import React, { useEffect, useRef, useState } from 'react';
import { List, Avatar, Typography, Empty, Image } from 'antd';
import { ChatMessage } from '@/src/features/chat/types';
import { useAuth } from '@/src/auth/hooks/useAuth';
import dayjs from 'dayjs';

const { Text } = Typography;

interface ChatMessagesProps {
    messages: ChatMessage[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
    const { user } = useAuth();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description="Chưa có tin nhắn nào trong nhóm này" />
            </div>
        );
    }

    return (
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f5f5f5' }}>
            <Image.PreviewGroup>
                <List
                    dataSource={messages}
                    renderItem={(item) => {
                        const isMe = item.senderId === user?.id;
                        const hasAttachments = item.attachments && item.attachments.length > 0;
                        const imageAttachments = item.attachments?.filter(a => a.type.startsWith('image/')) || [];

                        return (
                            <div style={{
                                display: 'flex',
                                justifyContent: isMe ? 'flex-end' : 'flex-start',
                                marginBottom: '16px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: isMe ? 'row-reverse' : 'row',
                                    maxWidth: '70%',
                                    gap: '8px'
                                }}>
                                    <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.senderName}`} />
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: isMe ? 'flex-end' : 'flex-start'
                                    }}>
                                        <div style={{ marginBottom: '4px' }}>
                                            <Text style={{ fontSize: '12px' }} type="secondary">{item.senderName}</Text>
                                            <Text style={{ fontSize: '12px', marginLeft: '8px' }} type="secondary">
                                                {dayjs(item.timestamp).format('HH:mm')}
                                            </Text>
                                        </div>

                                        {/* Text content */}
                                        {item.content && (
                                            <div style={{
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                backgroundColor: isMe ? '#1890ff' : '#fff',
                                                color: isMe ? '#fff' : 'rgba(0, 0, 0, 0.85)',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                wordBreak: 'break-word',
                                                marginBottom: hasAttachments ? '6px' : 0,
                                            }}>
                                                {item.content}
                                            </div>
                                        )}

                                        {/* Image attachments */}
                                        {imageAttachments.length > 0 && (
                                            <div style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 6,
                                                maxWidth: 320,
                                            }}>
                                                {imageAttachments.map((att) => (
                                                    <Image
                                                        key={att.id}
                                                        src={att.url}
                                                        alt={att.name}
                                                        width={imageAttachments.length === 1 ? 200 : 120}
                                                        style={{
                                                            borderRadius: 8,
                                                            objectFit: 'cover',
                                                            cursor: 'pointer',
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                        }}
                                                        placeholder
                                                        preview={{
                                                            mask: <span style={{ fontSize: 12 }}>Xem ảnh</span>,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    }}
                />
            </Image.PreviewGroup>
        </div>
    );
};

export default ChatMessages;
