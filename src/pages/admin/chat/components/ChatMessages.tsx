import React, { useEffect, useRef, useState } from 'react';
import { List, Typography, Empty, Image, Dropdown, MenuProps, Modal, Input } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ChatMessage } from '@/src/features/chat/types';
import { useAuth } from '@/src/auth/hooks/useAuth';
import dayjs from 'dayjs';

const { Text } = Typography;

interface ChatMessagesProps {
    messages: ChatMessage[];
    onDeleteMessage?: (msgId: string) => void;
    onEditMessage?: (msgId: string, newContent: string) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, onDeleteMessage, onEditMessage }) => {
    const { user } = useAuth();
    const scrollRef = useRef<HTMLDivElement>(null);

    const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
    const [editContent, setEditContent] = useState('');

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
                        const isMe = item.senderId === user?.id || item.senderId === (user as any)?._id;
                        const hasAttachments = item.attachments && item.attachments.length > 0;

                        const menuItems: MenuProps['items'] = [
                            {
                                key: 'edit',
                                icon: <EditOutlined />,
                                label: 'Sửa',
                                onClick: () => {
                                    setEditingMessage(item);
                                    setEditContent(item.content);
                                }
                            },
                            {
                                key: 'delete',
                                icon: <DeleteOutlined />,
                                label: 'Xóa',
                                danger: true,
                                onClick: () => {
                                    Modal.confirm({
                                        title: 'Xác nhận xóa',
                                        content: 'Bạn có chắc muốn xóa tin nhắn này?',
                                        okText: 'Xóa',
                                        okButtonProps: { danger: true },
                                        cancelText: 'Hủy',
                                        onOk: () => {
                                            if (onDeleteMessage) onDeleteMessage(item.id || (item as any)._id);
                                        }
                                    });
                                }
                            }
                        ];

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
                                    {isMe && (
                                        <div style={{ alignSelf: 'center', marginRight: '4px' }}>
                                            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                                                <div style={{ cursor: 'pointer', opacity: 0.5 }}>
                                                    <MoreOutlined />
                                                </div>
                                            </Dropdown>
                                        </div>
                                    )}


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

                                        {/* Image attachments - ảnh hiển thị TRƯỚC */}
                                        {item.attachments && item.attachments.length > 0 && (() => {
                                            // Chuẩn hóa: server trả về string[], local là ChatAttachment[]
                                            const imageUrls: string[] = (item.attachments as any[]).map((a) =>
                                                typeof a === 'string' ? a : a.url
                                            ).filter(Boolean);
                                            return imageUrls.length > 0 ? (
                                                <div style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: 6,
                                                    maxWidth: 320,
                                                    marginBottom: item.content ? 6 : 0,
                                                }}>
                                                    {imageUrls.map((url, idx) => (
                                                        <Image
                                                            key={idx}
                                                            src={url}
                                                            width={imageUrls.length === 1 ? 200 : 120}
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
                                            ) : null;
                                        })()}

                                        {/* Text content - hiển thị SAU ảnh */}
                                        {item.content && (
                                            <div style={{
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                backgroundColor: isMe ? '#1890ff' : '#fff',
                                                color: isMe ? '#fff' : 'rgba(0, 0, 0, 0.85)',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                wordBreak: 'break-word',
                                            }}>
                                                {item.content}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    }}
                />
            </Image.PreviewGroup>

            <Modal
                title="Sửa tin nhắn"
                open={!!editingMessage}
                onCancel={() => setEditingMessage(null)}
                onOk={() => {
                    if (editingMessage && editContent.trim()) {
                        if (onEditMessage) onEditMessage(editingMessage.id || (editingMessage as any)._id, editContent.trim());
                        setEditingMessage(null);
                        setEditContent('');
                    }
                }}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Input.TextArea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    autoSize={{ minRows: 2, maxRows: 6 }}
                />
            </Modal>
        </div>
    );
};

export default ChatMessages;
