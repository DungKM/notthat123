
export enum Role {
  DIRECTOR = 'DIRECTOR',
  ACCOUNTANT = 'ACCOUNTANT',
  SITE_MANAGER = 'SITE_MANAGER',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
}

// Map để hiển thị tên tiếng Việt trên giao diện
export const RoleLabel: Record<string, string> = {
  DIRECTOR: 'Giám đốc',
  ACCOUNTANT: 'Kế toán',
  SITE_MANAGER: 'Công trình',
  STAFF: 'Nhân viên',
  CUSTOMER: 'Khách hàng',
};

export interface User {
  id: string;
  account: string;
  name: string;
  role: Role;
  avatar?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
