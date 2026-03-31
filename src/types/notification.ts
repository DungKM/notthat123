// ─── Notification Types ───

export type NotificationType = 'task_assignment' | 'penalty' | 'bonus';

interface BaseNotification {
  id: string;
  type: NotificationType;
  assigneeId: string;
  assigneeName: string;
  assignedById: string;
  assignedByName: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TaskAssignmentNotification extends BaseNotification {
  type: 'task_assignment';
  projectId: string;
  projectName: string;
  taskDescription: string;
  message?: string;
}

export interface PenaltyNotification extends BaseNotification {
  type: 'penalty';
  message: string;
  projectId?: string;
  projectName?: string;
  taskDescription?: string;
}

export interface BonusNotification extends BaseNotification {
  type: 'bonus';
  message: string;
  projectId?: string;
  projectName?: string;
  taskDescription?: string;
}

export type TaskNotification =
  | TaskAssignmentNotification
  | PenaltyNotification
  | BonusNotification;
