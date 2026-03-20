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
  id?: string;
  projectId?: string;
  name: string;       // Tên hạng mục/vật tư
  material: string;   // Chất liệu
  unit: string;       // Đơn vị tính
  quantity: number;   // Số lượng
  price: number;      // Đơn giá bán
  amount: number;     // Thành tiền (quantity * price)
  costPrice?: number;
  isCompanyProduct: boolean; // Hàng do công ty tự sản xuất
  note: string;       // Ghi chú thêm
}

export interface Project {
  id: string;         // ID tự sinh
  name: string;       // Tên dự án
  address: string;    // Địa chỉ thi công
  ownerName: string;  // Tên khách hàng (Chủ đầu tư)
  ownerPhone: string; // Số điện thoại khách hàng
  managerId: any;     // Người phụ trách dự án
  createdById: any;   // Người tạo dự án
  status: 'Duyệt' | 'Chờ duyệt' | 'Từ chối' | 'pending' | 'approved' | 'reject'; // Trạng thái phê duyệt
  rejectReason?: string; // Lý do từ chối
  details: ProjectDetail[]; // Danh sách hạng mục
  companyProductsTotal: number; // Tổng tiền hàng công ty sản xuất
  externalProductsTotal: number; // Tổng tiền hàng ngoài
  revenue: number;    // Tổng doanh thu
  profit: number;     // Lợi nhuận
  startDate: string;  // Ngày bắt đầu
  endDate: string;    // Ngày kết thúc/bàn giao dự kiến
  createdAt: string;  // Thời gian tạo
  updatedAt: string;  // Thời gian cập nhật cuối
  progress?: ProjectProgress[]; // Dành cho luồng tiến độ bên ngoài
}
