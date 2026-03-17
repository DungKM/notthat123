// ─── Notification Types ───

export interface TaskNotification {
  id: string;
  projectId: string;
  projectName: string;
  assigneeId: string;       // ID người được giao
  assigneeName: string;
  assignedById: string;     // ID người giao (Giám đốc)
  assignedByName: string;
  taskDescription: string;
  createdAt: string;
  isRead: boolean;
}
