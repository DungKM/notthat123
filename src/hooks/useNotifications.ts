import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import { useNotificationService } from '@/src/api/services';
import { TaskNotification } from '@/src/types';
import { socket } from '@/src/api/socket';

const PAGE_SIZE = 10;

export const useNotifications = (userId?: string) => {
  const { request, getAll, meta } = useNotificationService();
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const pageRef = useRef(1);

  const loadPage = useCallback(async (page: number, append: boolean = false) => {
    if (!userId) return;
    try {
      const notifArray = await getAll({ page, limit: PAGE_SIZE });
      setNotifications(prev => {
        const updated = append ? [...prev, ...notifArray] : notifArray;
        setUnreadCount(updated.filter((n: any) => !n.isRead).length);
        return updated;
      });
    } catch (e) {
      console.error("Lỗi lấy thông báo:", e);
    }
  }, [userId, getAll]);

  // Cập nhật total từ meta (meta thay đổi sau mỗi getAll)
  useEffect(() => {
    if (meta?.total !== undefined) {
      setTotal(meta.total);
    }
  }, [meta]);

  // Reset về page 1 khi reload
  const loadNotifications = useCallback(() => {
    pageRef.current = 1;
    loadPage(1, false);
  }, [loadPage]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);

    const handleNewNotification = () => {
      loadNotifications();
      message.info('Bạn có thông báo mới!');
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      clearInterval(interval);
      socket.off('notification:new', handleNewNotification);
    };
  }, [loadNotifications]);

  const loadMore = useCallback(() => {
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    loadPage(nextPage, true);
  }, [loadPage]);

  const addNotification = useCallback((_notification: any) => {
    setTimeout(() => loadNotifications(), 1000);
  }, [loadNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await request('PATCH', `/${id}/read`);
      loadNotifications();
    } catch {}
  }, [request, loadNotifications]);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n: any) => !n.isRead);
    try {
      await Promise.all(unread.map(n => request('PATCH', `/${n.id || (n as any)._id}/read`)));
      loadNotifications();
    } catch {}
  }, [notifications, request, loadNotifications]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await request('DELETE', `/${id}`);
      message.success('Xoá thành công');
      loadNotifications();
    } catch {}
  }, [request, loadNotifications]);

  return {
    notifications,
    allNotifications: notifications,
    unreadCount,
    hasMore: total > 0 && notifications.length < total,
    loadMore,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
