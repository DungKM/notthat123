import React, { useRef, useState } from 'react';
import { Input, Button, Upload } from 'antd';
import { SendOutlined, PaperClipOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

interface ChatInputProps {
  onSendMessage: (content: string, files?: File[]) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const inputRef = useRef<any>(null);

  const handleSend = () => {
    const trimmed = message.trim();
    const files = fileList
      .map((file) => file.originFileObj)
      .filter((file): file is File => !!file);

    if (!trimmed && files.length === 0) return;

    onSendMessage(trimmed, files);
    setMessage('');
    setFileList([]);
    inputRef.current?.focus?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const uploadProps: UploadProps = {
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      setFileList((prev) => [...prev, file]);
      return false;
    },
    onRemove: (file) => {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
    },
    showUploadList: false,
  };

  return (
    <div
      style={{
        padding: 16,
        background: '#f7f7f7',
        borderTop: '1px solid #f1ebe5',
      }}
    >
      {fileList.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 10,
          }}
        >
          {fileList.map((file) => (
            <div
              key={file.uid}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                background: '#fff',
                border: '1px solid #ebe3dc',
                borderRadius: 999,
                fontSize: 13,
                color: '#5d4037',
              }}
            >
              <PaperClipOutlined />
              <span>{file.name}</span>
              <span
                onClick={() =>
                  setFileList((prev) => prev.filter((item) => item.uid !== file.uid))
                }
                style={{ cursor: 'pointer', color: '#999' }}
              >
                ×
              </span>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 10,
          background: '#fff',
          border: '1px solid #e7ddd6',
          borderRadius: 18,
          padding: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}
      >
        <Upload {...uploadProps}>
          <Button
            type="text"
            icon={<PaperClipOutlined />}
            disabled={disabled}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              color: '#6d4c41',
              flexShrink: 0,
            }}
          />
        </Upload>

        <Input.TextArea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Nhập tin nhắn..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={disabled}
          bordered={false}
          style={{
            resize: 'none',
            boxShadow: 'none',
            padding: '8px 0',
            background: 'transparent',
          }}
        />

        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={disabled || (!message.trim() && fileList.length === 0)}
          style={{
            height: 40,
            borderRadius: 12,
            paddingInline: 16,
            background: '#8d6e63',
            borderColor: '#8d6e63',
            boxShadow: 'none',
            flexShrink: 0,
          }}
        >
          Gửi
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;