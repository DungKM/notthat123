import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { useNotificationService } from '@/src/api/services';
import { TaskNotification } from '@/src/types';

export const useNotifications = (userId?: string) => {
  const { list: notifications, request, getAll } = useNotificationService();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getAll({ page: 1, limit: 100 });
      if (data) {
        const notifArray = Array.isArray(data) ? data : ((data as any).data || []);
        // Calculate unread count right after setting list
        setUnreadCount(notifArray.filter((n: any) => !n.isRead).length);
      }
    } catch (e) {
      console.error("Lỗi lấy thông báo:", e);
    }
  }, [userId, getAll]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const addNotification = useCallback((notification: any) => {
    // Triggers reload after backend creates a task notification
    setTimeout(() => loadNotifications(), 1000);
  }, [loadNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await request('PATCH', `/${id}/read`);
      loadNotifications();
    } catch {}
  }, [request, loadNotifications]);

  const markAllAsRead = useCallback(async () => {
    const unread = (notifications || []).filter((n: any) => !n.isRead);
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
    notifications: notifications || [],
    allNotifications: notifications || [],
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};
