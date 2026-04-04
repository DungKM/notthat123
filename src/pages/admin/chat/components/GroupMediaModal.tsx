import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Image, Spin, Empty, Tooltip } from 'antd';
import {
  FileOutlined, PictureOutlined, DownloadOutlined,
  FileWordOutlined, FileExcelOutlined, FilePdfOutlined, FileZipOutlined,
} from '@ant-design/icons';
import { useChatGroupService } from '@/src/api/services';

interface GroupMediaModalProps {
  open: boolean;
  onCancel: () => void;
  groupId: string;
  groupName: string;
}

const getFileIcon = (fmt: string) => {
  const f = (fmt || '').toLowerCase();
  if (['doc', 'docx'].includes(f)) return <FileWordOutlined style={{ fontSize: 22, color: '#2B5796' }} />;
  if (['xls', 'xlsx'].includes(f)) return <FileExcelOutlined style={{ fontSize: 22, color: '#1D6F42' }} />;
  if (['pdf'].includes(f)) return <FilePdfOutlined style={{ fontSize: 22, color: '#E74C3C' }} />;
  if (['zip', 'rar', '7z'].includes(f)) return <FileZipOutlined style={{ fontSize: 22, color: '#f59e0b' }} />;
  return <FileOutlined style={{ fontSize: 22, color: '#6366f1' }} />;
};

const getBgColor = (fmt: string) => {
  const f = (fmt || '').toLowerCase();
  if (['doc', 'docx'].includes(f)) return '#EBF2FB';
  if (['xls', 'xlsx'].includes(f)) return '#E8F5E9';
  if (['pdf'].includes(f)) return '#FEEBE9';
  if (['zip', 'rar', '7z'].includes(f)) return '#FEF3C7';
  return '#EEF2FF';
};

const GroupMediaModal: React.FC<GroupMediaModalProps> = ({ open, onCancel, groupId, groupName }) => {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const { request } = useChatGroupService();

  useEffect(() => {
    if (!open || !groupId) return;
    setLoadingMedia(true);
    request('GET', `/${groupId}/media`)
      .then((res) => setMediaList(res?.data || []))
      .catch(() => setMediaList([]))
      .finally(() => setLoadingMedia(false));

    setLoadingFiles(true);
    request('GET', `/${groupId}/files`)
      .then((res) => setFileList(res?.data || []))
      .catch(() => setFileList([]))
      .finally(() => setLoadingFiles(false));
  }, [open, groupId]);

  const handleDownload = async (url: string, name: string, key: string) => {
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

 
  const tabItems = [
    {
      key: 'media',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PictureOutlined />
          Ảnh đính kèm
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
        <Empty description="Chưa có ảnh nào được chia sẻ" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Image.PreviewGroup>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {mediaList.map((item: any, idx: number) => {
              const att = item.attachment || item;
              const url = att.url || att.fileUrl || '';
              const name = att.name || att.fileName || '';
              
              return (
              <div key={item.id || item._id || idx} style={{
                aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
                border: '1px solid #f0f0f0', background: '#f8f9fb', position: 'relative',
              }}>
                <Image
                  src={url}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  alt={name}
                  fallback="https://via.placeholder.com/150?text=L%E1%BB%97i+%E1%BA%A3nh"
                />
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
              );
            })}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {fileList.map((item: any, idx: number) => {
            // API trả về dạng { attachment: { url, name, format, ... }, createdAt }
            const att = item.attachment || item;
            const url = att.url || att.fileUrl || '';
            const name = att.name || att.fileName || 'Tài liệu';
            const fmt = (att.format || url.split('.').pop() || '').toLowerCase();
            const downloadKey = `file-${idx}`;
            const isDownloading = downloadingKey === downloadKey;

            return (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 12,
                border: '1px solid #e8ecf0', background: '#fff',
                transition: 'box-shadow 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                {/* File icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: getBgColor(fmt),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {getFileIcon(fmt)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: '#1e293b',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {name}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    <span style={{ textTransform: 'uppercase', marginRight: 6, fontWeight: 600, color: '#64748b' }}>
                      {fmt || 'FILE'}
                    </span>
                    · {formatDate(item.createdAt || item.sentAt || '')}
                  </div>
                </div>

                {/* Download button */}
                {url && (
                  <Tooltip title="Tải xuống">
                    <button
                      onClick={() => !isDownloading && handleDownload(url, name, downloadKey)}
                      disabled={isDownloading}
                      style={{
                        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                        background: 'rgba(99,102,241,0.1)', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#6366f1', cursor: isDownloading ? 'wait' : 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.2)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)')}
                    >
                      {isDownloading ? <Spin size="small" /> : <DownloadOutlined />}
                    </button>
                  </Tooltip>
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
