import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Image, Spin, Empty } from 'antd';
import { FileOutlined, PictureOutlined, DownloadOutlined } from '@ant-design/icons';
import { useChatGroupService } from '@/src/api/services';

interface GroupMediaModalProps {
  open: boolean;
  onCancel: () => void;
  groupId: string;
  groupName: string;
}

const GroupMediaModal: React.FC<GroupMediaModalProps> = ({ open, onCancel, groupId, groupName }) => {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const { request } = useChatGroupService();

  useEffect(() => {
    if (!open || !groupId) return;
    // Load media (images/videos)
    setLoadingMedia(true);
    request('GET', `/${groupId}/media`)
      .then((res) => setMediaList(res?.data || []))
      .catch(() => setMediaList([]))
      .finally(() => setLoadingMedia(false));

    // Load files (documents)
    setLoadingFiles(true);
    request('GET', `/${groupId}/files`)
      .then((res) => setFileList(res?.data || []))
      .catch(() => setFileList([]))
      .finally(() => setLoadingFiles(false));
  }, [open, groupId]);

  const formatBytes = (bytes: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);

  const tabItems = [
    {
      key: 'media',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PictureOutlined />
          Ảnh & Video
          {mediaList.length > 0 && (
            <span style={{
              background: '#6366f1', color: '#fff', borderRadius: 10,
              fontSize: 11, padding: '0 6px', lineHeight: '18px', fontWeight: 700,
            }}>{mediaList.length}</span>
          )}
        </span>
      ),
      children: loadingMedia ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
      ) : mediaList.length === 0 ? (
        <Empty description="Chưa có ảnh hoặc video nào được chia sẻ" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Image.PreviewGroup>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {mediaList.map((item: any, idx: number) => (
              <div key={item.id || item._id || idx} style={{
                aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
                border: '1px solid #f0f0f0', background: '#f8f9fb', position: 'relative',
              }}>
                {isImage(item.url || item.fileUrl || '') ? (
                  <Image
                    src={item.url || item.fileUrl}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    alt={item.fileName || ''}
                  />
                ) : (
                  <div style={{
                    height: '100%', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', color: '#64748b',
                  }}>
                    <span style={{ fontSize: 28 }}>🎬</span>
                    <span style={{ fontSize: 10, marginTop: 4, textAlign: 'center', padding: '0 4px' }}>
                      {item.fileName || 'Video'}
                    </span>
                  </div>
                )}
                {item.senderName && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
                    padding: '12px 6px 4px',
                    fontSize: 10, color: '#fff', lineHeight: 1.3,
                  }}>
                    {item.senderName}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Image.PreviewGroup>
      ),
    },
    {
      key: 'files',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FileOutlined />
          Tài liệu
          {fileList.length > 0 && (
            <span style={{
              background: '#f59e0b', color: '#fff', borderRadius: 10,
              fontSize: 11, padding: '0 6px', lineHeight: '18px', fontWeight: 700,
            }}>{fileList.length}</span>
          )}
        </span>
      ),
      children: loadingFiles ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
      ) : fileList.length === 0 ? (
        <Empty description="Chưa có tài liệu nào được chia sẻ" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {fileList.map((item: any, idx: number) => {
            const ext = (item.fileName || item.url || '').split('.').pop()?.toUpperCase() || 'FILE';
            return (
              <div key={item.id || item._id || idx} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 10,
                border: '1px solid #e8ecf0', background: '#f8f9fb',
                transition: 'box-shadow 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                {/* File type icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <FileOutlined style={{ color: '#fff', fontSize: 14 }} />
                  <span style={{ color: '#fff', fontSize: 8, fontWeight: 700, marginTop: 1 }}>{ext}</span>
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: '#1e293b',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.fileName || item.name || 'Tài liệu'}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    {item.senderName && <span>{item.senderName} · </span>}
                    {item.size ? <span>{formatBytes(item.size)} · </span> : null}
                    {formatDate(item.createdAt || item.sentAt || '')}
                  </div>
                </div>
                {/* Download */}
                {(item.url || item.fileUrl) && (
                  <a
                    href={item.url || item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: 'rgba(99,102,241,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#6366f1', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.2)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)')}
                    title="Tải xuống"
                  >
                    <DownloadOutlined />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={540}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PictureOutlined style={{ color: '#fff', fontSize: 15 }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Media & Tài liệu · {groupName}</span>
        </div>
      }
      styles={{ body: { padding: '16px 24px 24px', maxHeight: '65vh', overflowY: 'auto' } }}
    >
      <Tabs items={tabItems} defaultActiveKey="media" />
    </Modal>
  );
};

export default GroupMediaModal;
