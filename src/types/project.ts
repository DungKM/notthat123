// ─── Project Types ───

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

export interface ProjectDetail {
  id: string;
  projectId: string;
  name: string;       // Tên hạng mục
  material: string;   // Chất liệu
  unit: string;       // Đơn vị tính
  quantity: number;    // Số lượng
  price: number;       // Đơn giá
  amount: number;      // Thành tiền (quantity * price)
  costPrice: number;   // Giá vốn (chỉ GĐ/KT thấy)
  note: string;
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
