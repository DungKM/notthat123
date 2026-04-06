import React, { useRef, useState } from 'react';
import { Upload } from 'antd';
import type { UploadProps } from 'antd';
import { PictureOutlined, PaperClipOutlined, SendOutlined } from '@ant-design/icons';


interface ChatInputProps {
  onSendMessage: (content: string, files?: File[]) => void;
  disabled?: boolean;
}

const FilePreviewItem: React.FC<{
  item: { file: File; preview?: string; uid: string };
  onRemove: (uid: string) => void;
}> = ({ item, onRemove }) => {
  const isImg = item.file.type.startsWith('image/');
  const ext = item.file.name.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <div style={{
      position: 'relative', borderRadius: 8, overflow: 'hidden',
      border: '1px solid #e2e8f0', background: '#f8f9fb',
      width: isImg ? 68 : 'auto',
      height: isImg ? 68 : 'auto',
      minWidth: isImg ? 68 : 120,
      maxWidth: isImg ? 68 : 200,
      display: 'flex', alignItems: 'center',
    }}>
      {isImg && item.preview ? (
        <img src={item.preview} alt={item.file.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 10px', width: '100%',
        }}>
          {/* icon */}
          <div style={{
            width: 30, height: 30, borderRadius: 6, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: 7, fontWeight: 700 }}>{ext}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: '#1e293b',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{item.file.name}</div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>
              {(item.file.size / 1024).toFixed(1)} KB
            </div>
          </div>
        </div>
      )}
      {/* Remove button */}
      <button
        onClick={() => onRemove(item.uid)}
        style={{
          position: 'absolute', top: 2, right: 2,
          width: 18, height: 18, borderRadius: '50%',
          background: 'rgba(0,0,0,0.55)', border: 'none',
          cursor: 'pointer', color: '#fff', fontSize: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1,
        }}
      >✕</button>
    </div>
  );
};

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{ file: File; preview?: string; uid: string }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed && attachedFiles.length === 0) return;
    const files = attachedFiles.map(item => item.file);
    onSendMessage(trimmed, files.length > 0 ? files : undefined);
    setMessage('');
    // Revoke previews
    attachedFiles.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); });
    setAttachedFiles([]);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addFile = async (file: File) => {
    const isImg = file.type.startsWith('image/');
    const preview = isImg ? URL.createObjectURL(file) : undefined;
    const uid = Math.random().toString(36).substr(2, 9);
    setAttachedFiles(prev => [...prev, { file, preview, uid }]);
    return false;
  };

  const imageUploadProps: UploadProps = {
    accept: 'image/*',
    multiple: true,
    showUploadList: false,
    beforeUpload: addFile,
  };

  const fileUploadProps: UploadProps = {
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.csv',
    multiple: true,
    showUploadList: false,
    beforeUpload: addFile,
  };

  const removeFile = (uid: string) => {
    setAttachedFiles(prev => {
      const item = prev.find(i => i.uid === uid);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter(i => i.uid !== uid);
    });
  };

  const canSend = message.trim().length > 0 || attachedFiles.length > 0;

  return (
    <div style={{ padding: '12px 16px 14px', background: '#fff', borderTop: '1px solid #e8ecf0' }}>
      {/* Previews */}
      {attachedFiles.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8,
          padding: '10px 12px', background: '#f8f9fb',
          borderRadius: 10, marginBottom: 10, border: '1px solid #e8ecf0',
        }}>
          {attachedFiles.map(item => (
            <FilePreviewItem key={item.uid} item={item} onRemove={removeFile} />
          ))}
        </div>
      )}

      {/* Input row */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 6,
        background: '#f8f9fb', borderRadius: 14,
        padding: '6px 10px', border: '1px solid #e2e8f0',
      }}>
        {/* Upload image */}
        <Upload {...imageUploadProps}>
          <button
            title="Gửi ảnh"
            disabled={disabled}
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'transparent', border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              color: '#6366f1', fontSize: 18, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => !disabled && (e.currentTarget.style.color = '#4f46e5')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6366f1')}
          >
            <PictureOutlined />
          </button>
        </Upload>

        {/* Upload file */}
        <Upload {...fileUploadProps}>
          <button
            title="Gửi tài liệu (PDF, Word, Excel...)"
            disabled={disabled}
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'transparent', border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              color: '#f59e0b', fontSize: 18, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => !disabled && (e.currentTarget.style.color = '#d97706')}
            onMouseLeave={e => (e.currentTarget.style.color = '#f59e0b')}
          >
            <PaperClipOutlined />
          </button>
        </Upload>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn... (Enter để gửi)"
          disabled={disabled}
          rows={1}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#1e293b', fontSize: 16, lineHeight: 1.6,
            resize: 'none', padding: '6px 4px',
            minHeight: 34, maxHeight: 120, overflowY: 'auto',
            fontFamily: 'inherit',
          }}
          onInput={e => {
            const t = e.currentTarget;
            t.style.height = 'auto';
            t.style.height = Math.min(t.scrollHeight, 120) + 'px';
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !canSend}
          title="Gửi tin nhắn"
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: canSend && !disabled ? '#6366f1' : '#e2e8f0',
            border: 'none',
            cursor: canSend && !disabled ? 'pointer' : 'not-allowed',
            color: canSend && !disabled ? '#fff' : '#94a3b8',
            fontSize: 16, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >➤</button>
      </div>
    </div>
  );
};

export default ChatInput;