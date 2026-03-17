import { useState, useEffect, useCallback } from 'react';
import { TaskNotification } from '@/src/types';

const STORAGE_KEY = 'hochi_notifications';

const getAllNotifications = (): TaskNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveAllNotifications = (notifications: TaskNotification[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
};

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const [allNotifications, setAllNotifications] = useState<TaskNotification[]>([]);

  // Load notifications cho user hiện tại
  const loadNotifications = useCallback(() => {
    const all = getAllNotifications();
    setAllNotifications(all);
    if (userId) {
      setNotifications(all.filter((n) => n.assigneeId === userId));
    } else {
      setNotifications([]);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
    // Lắng nghe thay đổi từ tab khác hoặc cùng tab
    const handleStorage = () => loadNotifications();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Thêm thông báo mới (Giám đốc giao việc)
  const addNotification = useCallback((notification: Omit<TaskNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const all = getAllNotifications();
    const newNotification: TaskNotification = {
      ...notification,
      id: Math.random().toString(36).slice(2, 11),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    const updated = [newNotification, ...all];
    saveAllNotifications(updated);
    // Trigger reload cho tất cả hook instances
    window.dispatchEvent(new Event('storage'));
    return newNotification;
  }, []);

  // Đánh dấu đã đọc
  const markAsRead = useCallback((id: string) => {
    const all = getAllNotifications();
    const updated = all.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    saveAllNotifications(updated);
    window.dispatchEvent(new Event('storage'));
  }, []);

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = useCallback(() => {
    if (!userId) return;
    const all = getAllNotifications();
    const updated = all.map((n) =>
      n.assigneeId === userId ? { ...n, isRead: true } : n
    );
    saveAllNotifications(updated);
    window.dispatchEvent(new Event('storage'));
  }, [userId]);

  return {
    notifications,
    allNotifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
  };
};
