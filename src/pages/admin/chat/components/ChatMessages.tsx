import React, { useEffect, useRef, useState } from 'react';
import { Image, Modal, Spin, Tooltip } from 'antd';
import { DownloadOutlined, FileWordOutlined, FileExcelOutlined, FilePdfOutlined, FileZipOutlined, FileOutlined } from '@ant-design/icons';
import { ChatMessage } from '@/src/features/chat/types';
import { useAuth } from '@/src/auth/hooks/useAuth';
import dayjs from 'dayjs';

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
    name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();

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
    const [hoverMsgId, setHoverMsgId] = useState<string | null>(null);
    const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

    const handleDownloadFile = async (url: string, name: string, key: string) => {
        setDownloadingKey(key);
        try {
            const downloadUrl = `/api/chat/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(name)}`;
            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = name;
            link.click();
            window.URL.revokeObjectURL(blobUrl);
        } catch (e) {
            console.error('Download failed:', e);
        } finally {
            setDownloadingKey(null);
        }
    };

    const getFileIcon = (fmt: string, color: string) => {
        const style = { fontSize: 28, color };
        if (['doc', 'docx'].includes(fmt)) return <FileWordOutlined style={{ ...style, color: '#2B5796' }} />;
        if (['xls', 'xlsx'].includes(fmt)) return <FileExcelOutlined style={{ ...style, color: '#1D6F42' }} />;
        if (['pdf'].includes(fmt)) return <FilePdfOutlined style={{ ...style, color: '#E74C3C' }} />;
        if (['zip', 'rar', '7z'].includes(fmt)) return <FileZipOutlined style={style} />;
        return <FileOutlined style={style} />;
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8f9fb',
                gap: 12,
            }}>
                <div style={{ fontSize: 44 }}>💬</div>
                <div style={{ color: '#94a3b8', fontSize: 14 }}>Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!</div>
            </div>
        );
    }

    // Group by date
    const grouped: { date: string; msgs: ChatMessage[] }[] = [];
    messages.forEach(msg => {
        const date = dayjs(msg.timestamp).format('DD/MM/YYYY');
        const last = grouped[grouped.length - 1];
        if (last && last.date === date) last.msgs.push(msg);
        else grouped.push({ date, msgs: [msg] });
    });

    return (
        <div
            ref={scrollRef}
            style={{
                flex: 1,
                overflowY: 'auto',
                background: '#f8f9fb',
                padding: '16px 20px',
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 transparent',
            }}
        >
            <Image.PreviewGroup>
                {grouped.map(group => (
                    <div key={group.date}>
                        {/* Date divider */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            margin: '16px 0 12px',
                        }}>
                            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                            <span style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: '#94a3b8',
                                background: '#fff',
                                padding: '3px 10px',
                                borderRadius: 10,
                                border: '1px solid #e2e8f0',
                            }}>
                                {group.date === dayjs().format('DD/MM/YYYY') ? 'Hôm nay' :
                                    group.date === dayjs().subtract(1, 'day').format('DD/MM/YYYY') ? 'Hôm qua' : group.date}
                            </span>
                            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                        </div>

                        {group.msgs.map((item, index) => {
                            const isMe = item.senderId === user?.id || item.senderId === (user as any)?._id;
                            const msgId = item.id || (item as any)._id;
                            const prevMsg = index > 0 ? group.msgs[index - 1] : null;
                            const sameAsPrev = prevMsg?.senderId === item.senderId;

                            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
                            const allAttachments: any[] = (item.attachments || []) as any[];
                            const imageAttachments = allAttachments.filter((a: any) => {
                                const url = typeof a === 'string' ? a : a.url;
                                const fmt = (typeof a === 'string' ? '' : a.format || '').toLowerCase();
                                const ext = url?.split('.').pop()?.toLowerCase() || '';
                                return imageExtensions.includes(fmt) || imageExtensions.includes(ext);
                            });
                            const fileAttachments = allAttachments.filter((a: any) => {
                                const url = typeof a === 'string' ? a : a.url;
                                const fmt = (typeof a === 'string' ? '' : a.format || '').toLowerCase();
                                const ext = url?.split('.').pop()?.toLowerCase() || '';
                                return !imageExtensions.includes(fmt) && !imageExtensions.includes(ext);
                            });
                            const imageUrls: string[] = imageAttachments.map((a: any) =>
                                typeof a === 'string' ? a : a.url
                            ).filter(Boolean);



                            return (
                                <div
                                    key={msgId}
                                    style={{
                                        display: 'flex',
                                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                                        marginBottom: sameAsPrev ? 4 : 12,
                                    }}
                                    onMouseEnter={() => setHoverMsgId(msgId)}
                                    onMouseLeave={() => setHoverMsgId(null)}
                                >
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: isMe ? 'row-reverse' : 'row',
                                        gap: 10,
                                        maxWidth: '70%',
                                        alignItems: 'flex-end',
                                    }}>
                                        {/* Avatar */}
                                        {!isMe && (
                                            <div style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 10,
                                                background: getAvatarGradient(item.senderName || '?'),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                fontSize: 11,
                                                color: '#fff',
                                                flexShrink: 0,
                                                opacity: sameAsPrev ? 0 : 1,
                                            }}>
                                                {getInitials(item.senderName || '?')}
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: 3 }}>
                                            {!sameAsPrev && !isMe && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
                                                        {item.senderName}
                                                    </span>
                                                    <span style={{ fontSize: 10, color: '#94a3b8' }}>
                                                        {dayjs(item.timestamp).format('HH:mm')}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Images */}
                                            {imageUrls.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 320 }}>
                                                    {imageUrls.map((url, idx) => (
                                                        <Image
                                                            key={idx}
                                                            src={url}
                                                            width={imageUrls.length === 1 ? 220 : 130}
                                                            style={{ borderRadius: 12, objectFit: 'cover', cursor: 'pointer' }}
                                                            preview={{ mask: <span style={{ fontSize: 11 }}>Xem ảnh</span> }}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {/* File attachments */}
                                            {fileAttachments.length > 0 && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                    {fileAttachments.map((a: any, idx: number) => {
                                                        const url = typeof a === 'string' ? a : a.url;
                                                        const name = (typeof a === 'string' ? url.split('/').pop() : a.name) || 'Tệp đính kèm';
                                                        const fmt = ((typeof a === 'string' ? '' : a.format || url.split('.').pop()) || '').toLowerCase();
                                                        const downloadKey = `${msgId}-${idx}`;
                                                        const isDownloading = downloadingKey === downloadKey;
                                                        const iconColor = isMe ? '#fff' : '#6366f1';
                                                        return (
                                                            <Tooltip key={idx} title="Bấm để tải xuống">
                                                                <div
                                                                    onClick={() => !isDownloading && handleDownloadFile(url, name, downloadKey)}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 10,
                                                                        padding: '10px 14px',
                                                                        borderRadius: 12,
                                                                        background: isMe ? '#6366f1' : '#fff',
                                                                        border: isMe ? 'none' : '1px solid #e2e8f0',
                                                                        color: isMe ? '#fff' : '#1e293b',
                                                                        maxWidth: 280,
                                                                        cursor: isDownloading ? 'wait' : 'pointer',
                                                                        transition: 'opacity 0.15s',
                                                                        opacity: isDownloading ? 0.7 : 1,
                                                                    }}
                                                                >
                                                                    <span style={{ flexShrink: 0, lineHeight: 1 }}>{getFileIcon(fmt, iconColor)}</span>
                                                                    <div style={{ minWidth: 0, flex: 1 }}>
                                                                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                                                                        <div style={{ fontSize: 11, opacity: 0.65, textTransform: 'uppercase', marginTop: 2 }}>{fmt || 'file'}</div>
                                                                    </div>
                                                                    {isDownloading
                                                                        ? <Spin size="small" style={{ marginLeft: 'auto' }} />
                                                                        : <DownloadOutlined style={{ marginLeft: 'auto', fontSize: 16, opacity: 0.8, color: isMe ? '#fff' : '#6366f1' }} />
                                                                    }
                                                                </div>
                                                            </Tooltip>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Bubble */}
                                            {item.content && (
                                                <div style={{
                                                    padding: '9px 14px',
                                                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                    background: isMe ? '#6366f1' : '#fff',
                                                    color: isMe ? '#fff' : '#1e293b',
                                                    fontSize: 13.5,
                                                    lineHeight: 1.55,
                                                    wordBreak: 'break-word',
                                                    border: isMe ? 'none' : '1px solid #e2e8f0',
                                                }}>
                                                    {item.content}
                                                    {isMe && (
                                                        <span style={{
                                                            display: 'block',
                                                            textAlign: 'right',
                                                            fontSize: 10,
                                                            color: 'rgba(255,255,255,0.65)',
                                                            marginTop: 3,
                                                        }}>
                                                            {(item as any).status === 'sending' ? '⏳' :
                                                                (item as any).status === 'error' ? '❌' : dayjs(item.timestamp).format('HH:mm')}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action buttons on hover */}
                                        {isMe && hoverMsgId === msgId && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignSelf: 'center' }}
                                                onClick={e => e.stopPropagation()}>
                                                <button
                                                    title="Sửa"
                                                    onClick={() => { setEditingMessage(item); setEditContent(item.content); }}
                                                    style={{
                                                        width: 26, height: 26, border: '1px solid #e2e8f0',
                                                        background: '#fff', borderRadius: 7, cursor: 'pointer', fontSize: 12,
                                                    }}
                                                >✏️</button>
                                                <button
                                                    title="Xóa"
                                                    onClick={() => {
                                                        Modal.confirm({
                                                            title: 'Xác nhận xóa',
                                                            content: 'Bạn có chắc muốn xóa tin nhắn này?',
                                                            okText: 'Xóa',
                                                            okButtonProps: { danger: true },
                                                            cancelText: 'Hủy',
                                                            onOk: () => { if (onDeleteMessage) onDeleteMessage(msgId); }
                                                        });
                                                    }}
                                                    style={{
                                                        width: 26, height: 26, border: '1px solid #fecaca',
                                                        background: '#fff', borderRadius: 7, cursor: 'pointer', fontSize: 12,
                                                    }}
                                                >🗑️</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </Image.PreviewGroup>

            <Modal
                title="✏️ Sửa tin nhắn"
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
                <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={3}
                    style={{
                        width: '100%',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        padding: '8px 12px',
                        fontSize: 14,
                        resize: 'vertical',
                        outline: 'none',
                    }}
                />
            </Modal>
        </div>
    );
};

export default ChatMessages;
