import { Role } from './types';

export const ROUTES = {
  // Công khai (Public)
  TRANG_CHU: '/',
  SAN_PHAM: '/san-pham',
  CHI_TIET_SAN_PHAM: '/san-pham/:slug',
  CONG_TRINH: '/cong-trinh',
  GIOI_THIEU: '/gioi-thieu',
  VI_SAO_CHON_CHUNG_TOI: '/vi-sao-chon-chung-toi',
  LIEN_HE: '/lien-he',
  VIDEO: '/video',
  TUYEN_DUNG: '/tuyen-dung',
  DOI_TAC: '/doi-tac',
  CHI_TIET_DOI_TAC: '/doi-tac/:slug',
  THANH_TOAN: '/checkout',
  DANG_NHAP: '/login',
  TRO_CHUYEN: '/quan-tri/tin-nhan',

  // Quản trị (Admin)
  ADMIN_GOC: '/quan-tri',
  ADMIN_TONG_QUAN: '/quan-tri/tong-quan',
  ADMIN_CONG_TRINH: '/quan-tri/cong-trinh',
  ADMIN_CHI_TIET_CONG_TRINH: '/quan-tri/cong-trinh/:id',
  ADMIN_NHAN_VIEN: '/quan-tri/nhan-vien',
  ADMIN_DUYET_UNG_TIEN: '/quan-tri/duyet-ung-tien',
  ADMIN_TONG_HOP_CHAM_CONG: '/quan-tri/tong-hop-cham-cong',
  ADMIN_NGUOI_DUNG: '/quan-tri/nguoi-dung',
  ADMIN_DON_HANG: '/quan-tri/don-hang',
  ADMIN_SAN_PHAM: '/quan-tri/san-pham',
  ADMIN_DAN_MUC: '/quan-tri/danh-muc',
  ADMIN_QUAN_LY_TUYEN_DUNG: '/quan-tri/tuyen-dung-noi-bo',
  ADMIN_CHAM_CONG_CA_NHAN: '/quan-tri/cham-cong-ca-nhan',
  ADMIN_YEU_CAU_UNG_TIEN: '/quan-tri/yeu-ca-ung-tien',
  ADMIN_THONG_KE: '/quan-tri/thong-ke',
  ADMIN_QUAN_LY_LUONG: '/quan-tri/quan-ly-luong',
  ADMIN_SHOWCASE_PROJECTS: '/quan-tri/quan-ly-cong-trinh-ngoai',
  ADMIN_QUAN_LY_DOI_TAC: '/quan-tri/quan-ly-doi-tac',
} as const;

export interface RouteConfig {
  path: string;
  name: string;
  icon: React.ReactNode;
  access: string; // 'staff' | 'sales' | 'accountant' | 'director' | 'site_manager'
  roles: Role[];  
}

export const getDefaultRoute = (role: Role): string => {
  switch (role) {
    case Role.DIRECTOR:
      return ROUTES.ADMIN_TONG_QUAN;
    case Role.ACCOUNTANT:
      return ROUTES.ADMIN_NHAN_VIEN;

    case Role.SITE_MANAGER:
      return ROUTES.ADMIN_CONG_TRINH;
    case Role.STAFF:
      return ROUTES.ADMIN_CHAM_CONG_CA_NHAN;
    default:
      return ROUTES.ADMIN_TONG_QUAN;
  }
};
