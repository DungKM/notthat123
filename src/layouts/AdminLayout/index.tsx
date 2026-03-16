import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProLayout, PageContainer } from '@ant-design/pro-components';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { Dropdown, Space, Tag } from 'antd';
import { LogoutOutlined, UserOutlined, DashboardOutlined, ProjectOutlined, TeamOutlined, DollarOutlined, FileTextOutlined, CalendarOutlined, AppstoreOutlined, TagsOutlined, ShoppingCartOutlined, BarChartOutlined, MessageOutlined } from '@ant-design/icons';
import { Role } from '@/src/auth/types';
import { ROUTES } from '@/src/routes/index';
import logo from '@/src/statics/logo_hochi.jpg';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = "Hệ thống Quản lý" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Logic generate menu items dựa trên Role
  const getMenuData = () => {
    const adminMenus = [
      { path: ROUTES.ADMIN_TONG_QUAN, name: 'Bảng điều khiển', icon: <DashboardOutlined /> },
      { path: ROUTES.ADMIN_CONG_TRINH, name: 'Quản lý dự án', icon: <ProjectOutlined /> },
    ];
    const accountingMenus_kt = [
      // { path: ROUTES.ADMIN_CHAM_CONG_CA_NHAN, name: 'Chấm công cá nhân', icon: <CalendarOutlined /> },
    ]
    const accountingMenus = [
      { path: ROUTES.ADMIN_NHAN_VIEN, name: 'Bảng lương nhân sự', icon: <TeamOutlined /> },
      { path: ROUTES.ADMIN_DUYET_UNG_TIEN, name: 'Phê duyệt ứng tiền', icon: <DollarOutlined /> },
      // { path: ROUTES.ADMIN_QUAN_LY_LUONG, name: 'Quản lý lương', icon: <DollarOutlined /> },
      // { path: ROUTES.ADMIN_TONG_HOP_CHAM_CONG, name: 'Tổng hợp chấm công', icon: <FileTextOutlined /> },
      { path: ROUTES.ADMIN_NGUOI_DUNG, name: 'Quản lý người dùng', icon: <UserOutlined /> },
      { path: ROUTES.ADMIN_DON_HANG, name: 'Quản lý đơn hàng', icon: <ShoppingCartOutlined /> },
      { path: ROUTES.ADMIN_SAN_PHAM, name: 'Quản lý sản phẩm', icon: <AppstoreOutlined /> },
      { path: ROUTES.ADMIN_DANH_MUC, name: 'Quản lý danh mục', icon: <TagsOutlined /> },
      { path: ROUTES.ADMIN_QUAN_LY_TUYEN_DUNG, name: 'Quản lý tuyển dụng', icon: <TeamOutlined /> },
      { path: ROUTES.TRO_CHUYEN, name: 'Tin nhắn nhóm', icon: <MessageOutlined /> },
      { path: ROUTES.ADMIN_SHOWCASE_PROJECTS, name: 'Bài viết công trình (Showcase)', icon: <FileTextOutlined /> },

    ];

    const siteManagerMenus: any[] = [
      // { path: ROUTES.ADMIN_CONG_TRINH, name: 'Quản lý công trình', icon: <ProjectOutlined /> },
    ];

    const commonMenus = [
      { path: ROUTES.ADMIN_CHAM_CONG_CA_NHAN, name: 'Chấm công cá nhân', icon: <CalendarOutlined /> },
      { path: ROUTES.ADMIN_CONG_TRINH, name: 'Quản lý dự án', icon: <ProjectOutlined /> },
      { path: ROUTES.TRO_CHUYEN, name: 'Tin nhắn nhóm', icon: <MessageOutlined /> },
      { path: ROUTES.ADMIN_YEU_CAU_UNG_TIEN, name: 'Yêu cầu ứng tiền', icon: <DollarOutlined /> },
      { path: ROUTES.ADMIN_THONG_KE, name: 'Thống kê lương', icon: <BarChartOutlined /> },

      // { path: ROUTES.ADMIN_THONG_KE, name: 'Thống kê', icon: <BarChartOutlined /> },
    ];

    const staffMenus: any[] = [
      { path: ROUTES.ADMIN_CHAM_CONG_CA_NHAN, name: 'Chấm công cá nhân', icon: <CalendarOutlined /> },
      { path: ROUTES.ADMIN_CONG_TRINH, name: 'Quản lý dự án', icon: <ProjectOutlined /> },
      { path: ROUTES.TRO_CHUYEN, name: 'Tin nhắn nhóm', icon: <MessageOutlined /> },
      { path: ROUTES.ADMIN_YEU_CAU_UNG_TIEN, name: 'Yêu cầu ứng tiền', icon: <DollarOutlined /> },
       { path: ROUTES.ADMIN_THONG_KE, name: 'Thống kê lương', icon: <BarChartOutlined /> },
    ];

    if (user?.role === Role.DIRECTOR) {
      return [...adminMenus, ...accountingMenus, ...siteManagerMenus];
    }
    if (user?.role === Role.ACCOUNTANT) {
      return [...adminMenus, ...accountingMenus_kt, ...accountingMenus];
    }

    if (user?.role === Role.SITE_MANAGER) {
      return [...siteManagerMenus, ...commonMenus];
    }
    if (user?.role === Role.STAFF) {
      return [...staffMenus];
    }

    return [];
  };

  return (
    <div style={{ height: '100vh' }}>
      <ProLayout
        title={title}
        logo={logo}
        menuDataRender={getMenuData}
        menuItemRender={(item, dom) => (
          <div onClick={() => navigate(item.path || '/')}>
            {dom}
          </div>
        )}
        layout="mix"
        splitMenus={false}
        fixSiderbar
        fixedHeader
        breakpoint="md"
        siderWidth={250}
        token={{
          colorPrimary: '#13EC5B',
        }}
        contentStyle={{ padding: '4px' }}
        avatarProps={{
          src: user?.avatar,
          title: user?.name,
          render: (_, dom) => (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: 'Đăng xuất',
                    onClick: () => {
                      logout();
                      navigate('/login');
                    },
                  },
                ],
              }}
            >
              <Space style={{ cursor: 'pointer', padding: '0 8px' }}>
                {dom}
                <Tag color="green" className="hidden-mobile" style={{ margin: 0 }}>
                  {user?.role}
                </Tag>
              </Space>
            </Dropdown>
          ),
        }}
        headerTitleRender={(logo, title) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {logo}
            <h1 style={{ fontSize: '16px', margin: 0, whiteSpace: 'nowrap' }}>{title}</h1>
          </div>
        )}
      >
        <PageContainer ghost tabProps={{ size: 'large' }}>
          {children}
        </PageContainer>
      </ProLayout>
    </div>
  );
};

export default AdminLayout;
