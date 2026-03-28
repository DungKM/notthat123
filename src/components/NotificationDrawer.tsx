import React from 'react';
import { Drawer, List, Badge, Button, Typography, Empty, Space, Tag } from 'antd';
import { CheckOutlined, CheckCircleOutlined } from '@ant-design/icons';
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

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  open,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}) => {
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
          renderItem={(item) => (
            <List.Item
              style={{
                background: item.isRead ? 'transparent' : '#f0f8ff',
                padding: '12px 16px',
                marginBottom: 8,
                borderRadius: 8,
                border: item.isRead ? '1px solid #f0f0f0' : '1px solid #91caff',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (!item.isRead) onMarkAsRead(item.id);
              }}
            >
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Space size={4}>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Typography.Text>
                  </Space>
                  <Space size={4}>
                    {!item.isRead ? (
                      <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>Mới</Tag>
                    ) : (
                      <Tag color="default" style={{ margin: 0, fontSize: 11 }}>Đã đọc</Tag>
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

                <Typography.Text strong style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
                  {item.taskDescription}
                </Typography.Text>

                <Typography.Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5 }}>
                  <strong>{item.assignedByName}</strong> giao cho bạn tại dự án{' '}
                  <strong style={{ color: '#1890ff' }}>{item.projectName}</strong>
                </Typography.Text>
              </div>
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
};

export default NotificationDrawer;
