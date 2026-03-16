import { Role, User } from './types';

export const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    username: "giamdoc",
    password: "123456",
    name: "Nguyễn Giám Đốc",
    role: Role.DIRECTOR,
    status: 'ACTIVE',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Director',
  },
  {
    id: '2',
    username: "ketoan",
    password: "123456",
    name: "Trần Kế Toán",
    role: Role.ACCOUNTANT,
    status: 'ACTIVE',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Accountant',
  },

  {
    id: '4',
    username: "nhanvien",
    password: "123456",
    name: "Phạm Nhân Viên",
    role: Role.STAFF,
    status: 'ACTIVE',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Staff',
  },
  {
    id: '5',
    username: "congtrinh",
    password: "123456",
    name: "Hoàng Chỉ Huy",
    role: Role.SITE_MANAGER,
    status: 'ACTIVE',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SiteManager',
  }
];
