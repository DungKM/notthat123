import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Drawer, List, Badge, Button, Typography, Empty, Space, Tag } from 'antd';
import {
  CheckOutlined,
  ProjectOutlined,
  DollarOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { TaskNotification } from '@/src/types';

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  notifications: TaskNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

// ─── Config theo loại thông báo ───────────────────────────────────────────────
const typeConfig = {
  task_assignment: {
    color: '#1890ff',
    bg: '#e6f7ff',
    border: '#91caff',
    tag: { color: 'blue', label: 'Giao việc' },
    icon: <ProjectOutlined style={{ color: '#1890ff', fontSize: 16 }} />,
  },
  bonus: {
    color: '#52c41a',
    bg: '#f6ffed',
    border: '#b7eb8f',
    tag: { color: 'success', label: 'Thưởng' },
    icon: <DollarOutlined style={{ color: '#52c41a', fontSize: 16 }} />,
  },
  penalty: {
    color: '#ff4d4f',
    bg: '#fff2f0',
    border: '#ffccc7',
    tag: { color: 'error', label: 'Phạt' },
    icon: <WarningOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />,
  },
  advance_request: {
    color: '#faad14', // yellow/orange
    bg: '#fffbe6',
    border: '#ffe58f',
    tag: { color: 'warning', label: 'Ứng tiền' },
    icon: <DollarOutlined style={{ color: '#faad14', fontSize: 16 }} />,
  },
  advance_status: {
    color: '#13c2c2', // cyan
    bg: '#e6fffb',
    border: '#87e8de',
    tag: { color: 'cyan', label: 'Trạng thái ứng' },
    icon: <DollarOutlined style={{ color: '#13c2c2', fontSize: 16 }} />,
  },
};

const getConfig = (type: string) =>
  typeConfig[type as keyof typeof typeConfig] ?? typeConfig.task_assignment;

// ─── Render nội dung theo loại ────────────────────────────────────────────────
const renderContent = (item: TaskNotification) => {
  const cfg = getConfig(item.type);

  if (item.type === 'task_assignment') {
    return (
      <>
        <Typography.Text strong style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
          {item.taskDescription}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5 }}>
          <strong>{item.assignedByName}</strong> giao cho bạn tại dự án{' '}
          <strong>{item.projectName}</strong>
        </Typography.Text>
      </>
    );
  }

  if (item.type === 'bonus' || item.type === 'penalty') {
    return (
      <>
        <Typography.Text
          strong
          style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#000' }}
        >
          {item.message}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          Bởi: <strong>{item.assignedByName}</strong>
        </Typography.Text>
      </>
    );
  }

  if (item.type === 'advance_request' || item.type === 'advance_status') {
    return (
      <>
        <Typography.Text
          strong
          style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#000' }}
        >
          {item.message || (item.type === 'advance_status' ? 'Cập nhật trạng thái ứng tiền' : 'Có yêu cầu ứng tiền mới')}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          Từ: <strong>{item.assignedByName}</strong>
        </Typography.Text>
      </>
    );
  }

  return null;
};

// ─── Component chính ──────────────────────────────────────────────────────────
const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  open,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}) => {
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Drawer
      title={
        <Space>
          <span>Thông báo</span>
          {unreadCount > 0 && (
            <Badge count={unreadCount} style={{ backgroundColor: '#ff4d4f' }} />
          )}
        </Space>
      }
      extra={
        unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={onMarkAllAsRead}
          >
            Đọc tất cả
          </Button>
        )
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={420}
    >
      {notifications.length === 0 ? (
        <Empty description="Chưa có thông báo nào" />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => {
            const cfg = getConfig(item.type);

            return (
              <List.Item
                style={{
                  background: item.isRead ? 'transparent' : '#e6f7ff',
                  padding: '12px 16px',
                  marginBottom: 8,
                  borderRadius: 8,
                  border: `1px solid ${item.isRead ? '#f0f0f0' : '#91caff'}`,
                  cursor: 'pointer',
                  display: 'block',
                }}
                onClick={() => {
                  if (!item.isRead) onMarkAsRead(item.id);
                  if (item.type === 'advance_request') {
                    navigate('/quan-tri/duyet-ung-tien');
                    onClose();
                  } else if (item.type === 'advance_status') {
                    navigate('/quan-tri/thong-ke');
                    onClose();
                  }
                }}
              >
                <div style={{ width: '100%' }}>
                  {/* Header: icon + loại + thời gian + nút */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Space size={6}>
                      {cfg.icon}
                      <Tag
                        color={cfg.tag.color}
                        style={{ margin: 0, fontSize: 11, fontWeight: 600 }}
                      >
                        {cfg.tag.label}
                      </Tag>
                    </Space>

                    <Space size={4}>
                      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                        {dayjs(item.createdAt).format('DD/MM HH:mm')}
                      </Typography.Text>
                      {!item.isRead && (
                        <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>
                          Mới
                        </Tag>
                      )}
                      <Button
                        type="text"
                        danger
                        size="small"
                        style={{ padding: '0 4px', height: 'auto', fontSize: 12 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id || (item as any)._id);
                        }}
                      >
                        Xóa
                      </Button>
                    </Space>
                  </div>

                  {/* Nội dung theo loại */}
                  {renderContent(item)}
                </div>
              </List.Item>
            );
          }}
        />
      )}
    </Drawer>
  );
};

export default NotificationDrawer;
