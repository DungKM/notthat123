
export enum Role {
  DIRECTOR = 'Giám đốc',
  ACCOUNTANT = 'Kế toán',
  STAFF = 'Nhân viên',
  SITE_MANAGER = 'Công trình',
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface ProjectProgressTask {
  id: string;
  work: string;
  employee: string;
  updatedAt: string;
}

export type ProjectStatus =
  | 'Tư vấn + gặp khách + khảo sát'
  | 'Lập dự toán ngân sách'
  | 'Duyệt hợp đồng'
  | 'Thi công sản xuất'
  | 'Bàn giao thanh lý hợp đồng'
  | 'Phát sinh hợp đồng';

export interface ProjectProgress {
  id: string;
  status: ProjectStatus;
  tasks: ProjectProgressTask[];
}

export interface Project {
  id: string;
  name: string;
  address: string;
  ownerName: string;
  ownerPhone: string;
  managerId: string;
  createdBy?: string;
  status: 'Duyệt' | 'Chờ duyệt' | 'Từ chối';
  rejectReason?: string;
  createdAt: string;
  details: ProjectDetail[];
  progress?: ProjectProgress[];
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  workDay: number;
  otDays: number;
}

export interface Employee {
  id: string;
  name: string;
  baseSalary: number;
  bonus: number;
  penalty: number;
  advance: number;
  totalSalary: number;
}

export interface AdvanceRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  reason: string;
  requestDate: string;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối';
  approvedBy?: string;
  approvedDate?: string;
  transferProof?: string; // URL ảnh chứng từ
  note?: string;
}

export interface AttendanceSummary {
  id: string;
  staffId: string;
  staffName: string;
  month: string;
  totalWorkDays: number;
  totalOTDays: number;
  totalLate: number;
  records: AttendanceRecord[];
}

export interface ProjectDetail {
  id: string;
  projectId: string;
  name: string; // Tên dự án/hạng mục
  material: string; // Chất liệu
  unit: string; // Đơn vị tính
  quantity: number; // Số lượng
  price: number; // Đơn giá
  amount: number; // Thành tiền (quantity * price)
  costPrice: number; // Giá vốn (chỉ Giám đốc/Kế toán thấy)
  note: string;
}

export interface WorkdaySettings {
  id: string;
  fullDayHours: number; // Số giờ để tính 1 công
  halfDayHours: number; // Số giờ để tính 0.5 công
}
export type ShowcaseProjectCategory = 'Nhà ở' | 'Thương mại' | 'Công nghiệp';

export interface ShowcaseProject {
  id: string;
  slug: string;
  title: string;
  category: ShowcaseProjectCategory;
  coverImage: string;
  gallery?: string[];
  location?: string;
  year?: string;
  area?: string;
  excerpt: string;
  content: string[];
}

export interface Partner {
  slug: string;
  year: string;
  title: string;
  description: string;
  image: string;
  content: string;
}

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
