// ─── Notification Types ───

export type NotificationType = 'task_assignment' | 'penalty' | 'bonus' | 'advance_request' | 'advance_status';

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
  message?: string;
}

export interface TaskAssignmentNotification extends BaseNotification {
  type: 'task_assignment';
  projectId: string;
  projectName: string;
  taskDescription: string;
}

export interface PenaltyNotification extends BaseNotification {
  type: 'penalty';
  projectId?: string;
  projectName?: string;
  taskDescription?: string;
}

export interface BonusNotification extends BaseNotification {
  type: 'bonus';
  projectId?: string;
  projectName?: string;
  taskDescription?: string;
}

export interface AdvanceRequestNotification extends BaseNotification {
  type: 'advance_request';
}

export interface AdvanceStatusNotification extends BaseNotification {
  type: 'advance_status';
}

export type TaskNotification =
  | TaskAssignmentNotification
  | PenaltyNotification
  | BonusNotification
  | AdvanceRequestNotification
  | AdvanceStatusNotification;
