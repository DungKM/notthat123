
export enum Role {
  DIRECTOR = 'Giám đốc',
  ACCOUNTANT = 'Kế toán',
  STAFF = 'Nhân viên',
  SITE_MANAGER = 'Công trình',
  CUSTOMER = 'Khách hàng',
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  avatar?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
