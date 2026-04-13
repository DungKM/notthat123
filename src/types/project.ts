// ─── Project Types ───

export interface ProjectProgressTask {
  id?: string;
  work?: string;
  employee?: string;
  name?: string; // Backend API format
  user?: string; // Backend API format
  userId?: string; 
  assignedDate?: string; // Ngày được giao việc
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
  id?: string;
  status?: ProjectStatus;
  stage?: ProjectStatus; // Backend API format
  tasks?: ProjectProgressTask[];
  updates?: ProjectProgressTask[]; // Backend API format
}

export interface ProjectDetail {
  id?: string;
  projectId?: string;
  type?: 'external' | 'commercial' | 'company' | string; // Phân loại hàng hóa từ API
  rowType?: 'group' | 'item'; // Loại dòng bảng (danh mục hay hạng mục) trên UI
  categoryId?: string;     // Mã danh mục định danh từ ItemCategory
  parentCategoryId?: string; // Nếu là 'item', đây là ID của nhóm cha
  name: string;       // Tên hạng mục/vật tư
  material: string;   // Chất liệu
  origin?: string; // Nơi sản xuất / Xưởng
  unit: string;       // Đơn vị tính
  size?: string;      // Kích thước
  quantity: number;   // Số lượng
  price: number;      // Đơn giá bán
  amount: number;     // Thành tiền (quantity * price)
  costPrice?: number;
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
  totalAmount: number; // Tổng tiền hiển thị
  companyProductsTotal: number; // Tổng tiền hàng công ty sản xuất
  commercialProductsTotal: number; // Tổng tiền hàng thương mại
  externalProductsTotal: number; // Tổng tiền hàng ngoài
  revenue: number;    // Tổng doanh thu
  profit: number;     // Lợi nhuận
  startDate: string;  // Ngày bắt đầu
  endDate: string;    // Ngày kết thúc/bàn giao dự kiến
  createdAt: string;  // Thời gian tạo
  updatedAt: string;  // Thời gian cập nhật cuối
  progress?: ProjectProgress[]; // Dành cho luồng tiến độ bên ngoài
  currentProgress?: string; // Trạng thái tiến độ hiện tại từ API
}
