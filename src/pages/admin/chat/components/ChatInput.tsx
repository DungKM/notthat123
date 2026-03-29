import React, { useRef, useState } from 'react';
import { Upload } from 'antd';
import type { UploadProps } from 'antd';

interface ChatInputProps {
  onSendMessage: (content: string, files?: File[]) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [imageFiles, setImageFiles] = useState<{ file: File; preview: string; uid: string }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed && imageFiles.length === 0) return;
    const files = imageFiles.map(item => item.file);
    onSendMessage(trimmed, files.length > 0 ? files : undefined);
    setMessage('');
    setImageFiles([]);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const imageUploadProps: UploadProps = {
    accept: 'image/*',
    multiple: true,
    showUploadList: false,
    beforeUpload: file => {
      const previewUrl = URL.createObjectURL(file);
      setImageFiles(prev => [
        ...prev,
        { file, preview: previewUrl, uid: Math.random().toString(36).substr(2, 9) },
      ]);
      return false;
    },
  };

  const removeImage = (uid: string) => {
    setImageFiles(prev => {
      const item = prev.find(i => i.uid === uid);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(i => i.uid !== uid);
    });
  };

  const canSend = message.trim().length > 0 || imageFiles.length > 0;

  return (
    <div style={{
      padding: '12px 16px 14px',
      background: '#fff',
      borderTop: '1px solid #e8ecf0',
    }}>
      {/* Image previews */}
      {imageFiles.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          padding: '10px 12px',
          background: '#f8f9fb',
          borderRadius: 10,
          marginBottom: 10,
          border: '1px solid #e8ecf0',
        }}>
          {imageFiles.map(item => (
            <div
              key={item.uid}
              style={{
                position: 'relative',
                width: 68,
                height: 68,
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
              }}
            >
              <img src={item.preview} alt={item.file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => removeImage(item.uid)}
                style={{
                  position: 'absolute', top: 2, right: 2,
                  width: 18, height: 18,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.55)',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        background: '#f8f9fb',
        borderRadius: 14,
        padding: '6px 10px',
        border: '1px solid #e2e8f0',
      }}>
        {/* Upload image button */}
        <Upload {...imageUploadProps}>
          <button
            title="Gửi ảnh"
            disabled={disabled}
            style={{
              width: 34, height: 34,
              borderRadius: 8,
              background: 'transparent',
              border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              color: '#6366f1',
              fontSize: 17,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            🖼️
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
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#1e293b',
            fontSize: 13.5,
            lineHeight: 1.6,
            resize: 'none',
            padding: '6px 4px',
            minHeight: 34,
            maxHeight: 120,
            overflowY: 'auto',
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
            width: 36, height: 36,
            borderRadius: 10,
            background: canSend && !disabled ? '#6366f1' : '#e2e8f0',
            border: 'none',
            cursor: canSend && !disabled ? 'pointer' : 'not-allowed',
            color: canSend && !disabled ? '#fff' : '#94a3b8',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
        >
          ➤
        </button>
      </div>

      <div style={{ fontSize: 11, color: '#cbd5e1', textAlign: 'center', marginTop: 5 }}>
        Enter để gửi · Shift+Enter xuống dòng
      </div>
    </div>
  );
};

export default ChatInput;