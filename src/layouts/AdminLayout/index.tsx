import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProLayout, PageContainer } from '@ant-design/pro-components';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { Dropdown, Space, Tag, Badge } from 'antd';
import { LogoutOutlined, UserOutlined, DashboardOutlined, ProjectOutlined, TeamOutlined, DollarOutlined, FileTextOutlined, CalendarOutlined, AppstoreOutlined, TagsOutlined, ShoppingCartOutlined, BarChartOutlined, MessageOutlined, BellOutlined } from '@ant-design/icons';
import { Role } from '@/src/auth/types';
import { ROUTES } from '@/src/routes/index';
import logo from '@/src/statics/logo_hochi.jpg';
import { useNotifications } from '@/src/hooks/useNotifications';
import NotificationDrawer from '@/src/components/NotificationDrawer';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = "Hệ thống Quản lý" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user?.id);

  // Logic generate menu items dựa trên Role
  const getMenuData = () => {
    // ── Menu nhóm cho Giám đốc & Kế toán ──
    const noiBo = {
      path: '/quan-tri/noi-bo',
      name: 'Quản lý nội bộ',
      icon: <TeamOutlined />,
      children: [
        { path: ROUTES.ADMIN_TONG_QUAN, name: 'Bảng điều khiển', icon: <DashboardOutlined /> },
        { path: ROUTES.ADMIN_CONG_TRINH, name: 'Quản lý dự án', icon: <ProjectOutlined /> },
        { path: ROUTES.ADMIN_NHAN_VIEN, name: 'Bảng lương nhân sự', icon: <TeamOutlined /> },
        { path: ROUTES.ADMIN_DUYET_UNG_TIEN, name: 'Phê duyệt ứng tiền', icon: <DollarOutlined /> },
        { path: ROUTES.ADMIN_NGUOI_DUNG, name: 'Quản lý người dùng', icon: <UserOutlined /> },
        { path: ROUTES.TRO_CHUYEN, name: 'Tin nhắn nhóm', icon: <MessageOutlined /> },
      ],
    };

    const sanPham = {
      path: '/quan-tri/san-pham-group',
      name: 'Quản lý sản phẩm',
      icon: <AppstoreOutlined />,
      children: [
        { path: ROUTES.ADMIN_DON_HANG, name: 'Quản lý đơn hàng', icon: <ShoppingCartOutlined /> },
        { path: ROUTES.ADMIN_SAN_PHAM, name: 'Quản lý sản phẩm', icon: <AppstoreOutlined /> },
        { path: ROUTES.ADMIN_DANH_MUC, name: 'Quản lý danh mục sản phẩm', icon: <TagsOutlined /> },
        { path: ROUTES.ADMIN_DANH_MUC_CONG_TRINH, name: 'Quản lý danh mục công trình', icon: <TagsOutlined /> },
        { path: ROUTES.ADMIN_SHOWCASE_PROJECTS, name: 'Bài viết công trình', icon: <FileTextOutlined /> },
        { path: ROUTES.ADMIN_QUAN_LY_DOI_TAC, name: 'Quản lý đối tác', icon: <ProjectOutlined /> },
        { path: ROUTES.ADMIN_QUAN_LY_TUYEN_DUNG, name: 'Quản lý tuyển dụng', icon: <TeamOutlined /> },
        { path: ROUTES.ADMIN_QUAN_LY_LIEN_HE, name: 'Quản lý liên hệ', icon: <MessageOutlined /> },
      ],
    };

    const siteManagerMenus: any[] = [];

    const staffMenus: any[] = [
      { path: ROUTES.ADMIN_CONG_TRINH, name: 'Quản lý dự án', icon: <ProjectOutlined /> },
      { path: ROUTES.TRO_CHUYEN, name: 'Tin nhắn nhóm', icon: <MessageOutlined /> },
      { path: ROUTES.ADMIN_THONG_KE, name: 'Lương', icon: <BarChartOutlined /> },
    ];

    const commonMenus = [
      { path: ROUTES.ADMIN_CONG_TRINH, name: 'Quản lý dự án', icon: <ProjectOutlined /> },
      { path: ROUTES.TRO_CHUYEN, name: 'Tin nhắn nhóm', icon: <MessageOutlined /> },
      { path: ROUTES.ADMIN_THONG_KE, name: 'Lương', icon: <BarChartOutlined /> },
    ];

    if (user?.role === Role.DIRECTOR) {
      return [noiBo, sanPham];
    }
    if (user?.role === Role.ACCOUNTANT) {
      return [noiBo, sanPham];
    }

    if (user?.role === Role.SITE_MANAGER) {
      return [...siteManagerMenus, ...commonMenus];
    }
    if (user?.role === Role.STAFF) {
      return [...staffMenus];
    }
    if (user?.role === Role.CUSTOMER) {
      return [
        { path: ROUTES.TRO_CHUYEN, name: 'Tin nhắn', icon: <MessageOutlined /> },
      ];
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
            <Space style={{ cursor: 'pointer', padding: '0 8px' }}>
              <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                <BellOutlined
                  style={{ fontSize: 20, cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotifOpen(true);
                  }}
                />
              </Badge>
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
                <Space>
                  {dom}
                  <Tag color="green" className="hidden-mobile" style={{ margin: 0 }}>
                    {user?.role}
                  </Tag>
                </Space>
              </Dropdown>
            </Space>
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

      <NotificationDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </div>
  );
};

export default AdminLayout;
