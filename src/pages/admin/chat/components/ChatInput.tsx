import React, { useRef, useState } from 'react';
import { Input, Button, Upload } from 'antd';
import { SendOutlined, PictureOutlined, CloseCircleFilled } from '@ant-design/icons';
import type { UploadProps } from 'antd';

interface ChatInputProps {
  onSendMessage: (content: string, files?: File[]) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [imageFiles, setImageFiles] = useState<{ file: File; preview: string; uid: string }[]>([]);
  const inputRef = useRef<any>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed && imageFiles.length === 0) return;
    const files = imageFiles.map((item) => item.file);
    onSendMessage(trimmed, files.length > 0 ? files : undefined);
    setMessage('');
    setImageFiles([]);
    inputRef.current?.focus?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const imageUploadProps: UploadProps = {
    accept: 'image/*',
    multiple: true,
    showUploadList: false,
    beforeUpload: (file) => {
      const previewUrl = URL.createObjectURL(file);
      setImageFiles((prev) => [
        ...prev,
        { file, preview: previewUrl, uid: Math.random().toString(36).substr(2, 9) },
      ]);
      return false;
    },
  };

  const removeImage = (uid: string) => {
    setImageFiles((prev) => {
      const item = prev.find((i) => i.uid === uid);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.uid !== uid);
    });
  };

  return (
    <div
      style={{
        padding: 16,
        background: '#f7f7f7',
        borderTop: '1px solid #f1ebe5',
      }}
    >
      {/* Image preview area */}
      {imageFiles.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 10,
            padding: 8,
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #ebe3dc',
          }}
        >
          {imageFiles.map((item) => (
            <div
              key={item.uid}
              style={{
                position: 'relative',
                width: 72,
                height: 72,
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid #e8e0d8',
              }}
            >
              <img
                src={item.preview}
                alt={item.file.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <CloseCircleFilled
                onClick={() => removeImage(item.uid)}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  fontSize: 18,
                  color: 'rgba(0,0,0,0.55)',
                  cursor: 'pointer',
                  background: '#fff',
                  borderRadius: '50%',
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 6,
          background: '#fff',
          border: '1px solid #e7ddd6',
          borderRadius: 18,
          padding: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}
      >
        {/* Image upload button */}
        <Upload {...imageUploadProps}>
          <Button
            type="text"
            icon={<PictureOutlined />}
            disabled={disabled}
            title="Gửi ảnh"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              color: '#43a047',
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
          disabled={disabled || (!message.trim() && imageFiles.length === 0)}
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