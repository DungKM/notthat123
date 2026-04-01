import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProLayout, PageContainer } from '@ant-design/pro-components';
import { useAuth } from '@/src/auth/hooks/useAuth';
import { Dropdown, Space, Tag, Badge, Grid, message } from 'antd';
import { LogoutOutlined, UserOutlined, DashboardOutlined, ProjectOutlined, TeamOutlined, DollarOutlined, FileTextOutlined, CalendarOutlined, AppstoreOutlined, TagsOutlined, ShoppingCartOutlined, BarChartOutlined, MessageOutlined, BellOutlined, VideoCameraOutlined, ReloadOutlined } from '@ant-design/icons';
import { Role } from '@/src/auth/types';
import { ROUTES } from '@/src/routes/index';
import logo from '@/src/statics/logo_hochi.jpg';
import { useNotifications } from '@/src/hooks/useNotifications';
import NotificationDrawer from '@/src/components/NotificationDrawer';
import { connectSocket, disconnectSocket, socket } from '@/src/api/socket';
interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = "Hệ thống Quản lý" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications(user?.id);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [collapsed, setCollapsed] = useState(isMobile);

  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (user?.id) {
      connectSocket();

      const handleLockAccount = (data: any) => {
        message.error(data?.message || 'Tài khoản của bạn đã bị vô hiệu hóa.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      };

      socket.on('auth:lock_account', handleLockAccount);

      return () => {
        socket.off('auth:lock_account', handleLockAccount);
        disconnectSocket();
      };
    } else {
      return () => {
        disconnectSocket();
      };
    }
  }, [user?.id]);

  // Logic generate menu items dựa trên Role
  const getMenuData = () => {
    // ── Menu nhóm cho Giám đốc & Kế toán ──
    const noiBo = {
      path: '/quan-tri/noi-bo',
      name: 'Quản lý nội bộ',
      icon: <TeamOutlined />,
      children: [
        { path: ROUTES.ADMIN_TONG_QUAN, name: 'Bảng thống kê', icon: <DashboardOutlined /> },
        { path: ROUTES.ADMIN_CONG_TRINH, name: 'Quản lý dự án', icon: <ProjectOutlined /> },
        // { path: ROUTES.ADMIN_DANH_MUC_TIEN_DO, name: 'Danh mục tiến độ dự án', icon: <TagsOutlined /> },
        { path: ROUTES.ADMIN_NHAN_VIEN, name: 'Bảng lương nhân sự', icon: <TeamOutlined /> },
        { path: ROUTES.ADMIN_DUYET_UNG_TIEN, name: 'Phê duyệt ứng tiền', icon: <DollarOutlined /> },
        { path: ROUTES.ADMIN_NGUOI_DUNG, name: 'Quản lý người dùng', icon: <UserOutlined /> },
        { path: ROUTES.TRO_CHUYEN, name: 'Tin nhắn nhóm', icon: <MessageOutlined /> },
      ],
    };

    const sanPham = {
      path: '/quan-tri/san-pham-group',
      name: 'Quản lý bán hàng',
      icon: <AppstoreOutlined />,
      children: [
        { path: ROUTES.ADMIN_DON_HANG, name: 'Quản lý đơn hàng', icon: <ShoppingCartOutlined /> },
        {
          path: '/quan-tri/san-pham-group/sp',
          name: 'Sản phẩm',
          icon: <AppstoreOutlined />,
          children: [
            { path: ROUTES.ADMIN_SAN_PHAM, name: 'Quản lý sản phẩm', icon: <AppstoreOutlined /> },
            { path: ROUTES.ADMIN_DANH_MUC, name: 'Quản lý danh mục ', icon: <TagsOutlined /> },
          ]
        },
        {
          path: '/quan-tri/san-pham-group/ct',
          name: 'Công trình',
          icon: <ProjectOutlined />,
          children: [
            { path: ROUTES.ADMIN_SHOWCASE_PROJECTS, name: 'Bài viết công trình', icon: <FileTextOutlined /> },
            { path: ROUTES.ADMIN_DANH_MUC_CONG_TRINH, name: 'Quản lý danh mục', icon: <TagsOutlined /> },
          ]
        },
        { path: ROUTES.ADMIN_QUAN_LY_DOI_TAC, name: 'Quản lý đối tác', icon: <ProjectOutlined /> },
        { path: ROUTES.ADMIN_QUAN_LY_TUYEN_DUNG, name: 'Quản lý tuyển dụng', icon: <TeamOutlined /> },
        { path: ROUTES.ADMIN_QUAN_LY_LIEN_HE, name: 'Quản lý liên hệ', icon: <MessageOutlined /> },
        { path: ROUTES.ADMIN_VIDEO, name: 'Quản lý Video', icon: <VideoCameraOutlined /> },
        { path: ROUTES.ADMIN_DANH_GIA, name: 'Quản lý đánh giá', icon: <MessageOutlined /> },
      ],
    };

    const siteManagerMenus: any[] = [];

    const staffMenus: any[] = [
      { path: ROUTES.ADMIN_CONG_TRINH, name: 'Quản lý dự án', icon: <ProjectOutlined /> },
      { path: ROUTES.TRO_CHUYEN, name: 'Tin nhắn nhóm', icon: <MessageOutlined /> },
      { path: ROUTES.ADMIN_THONG_KE, name: 'Chấm công và bảng lương', icon: <DollarOutlined /> },
      { path: ROUTES.ADMIN_THONG_KE_THU_NHAP, name: 'Thống kê thu nhập', icon: <BarChartOutlined /> },
    ];

    const commonMenus = [
      { path: ROUTES.ADMIN_CONG_TRINH, name: 'Quản lý dự án', icon: <ProjectOutlined /> },
      { path: ROUTES.TRO_CHUYEN, name: 'Tin nhắn nhóm', icon: <MessageOutlined /> },
      { path: ROUTES.ADMIN_THONG_KE, name: 'Chấm công và bảng lương', icon: <DollarOutlined /> },
      { path: ROUTES.ADMIN_THONG_KE_THU_NHAP, name: 'Thống kê thu nhập', icon: <BarChartOutlined /> },
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
          <div onClick={() => {
            if (!item.children) {
              navigate(item.path || '/');
              if (isMobile) {
                setCollapsed(true);
              }
            }
          }}>
            {dom}
          </div>
        )}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        layout="mix"
        splitMenus={false}
        fixSiderbar
        fixedHeader
        breakpoint="md"
        siderWidth={250}
        token={{
          colorPrimary: '#13EC5B',
        }}
        contentStyle={{ padding: isMobile ? '0 2px' : '16px 24px' }}
        avatarProps={{
          src: user?.avatar,
          title: user?.name,
          render: (_, dom) => (
            <Space style={{ cursor: 'pointer', padding: '0 8px' }} size="middle">
              <ReloadOutlined
                style={{ fontSize: 18, cursor: 'pointer', color: '#666' }}
                title="Tải lại trang"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.reload();
                }}
              />
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
                    {user?.role === Role.DIRECTOR ? 'Giám đốc' :
                      user?.role === Role.ACCOUNTANT ? 'Kế toán' :
                        user?.role === Role.SITE_MANAGER ? 'Quản lý công trình' :
                          user?.role === Role.STAFF ? 'Nhân viên' : user?.role}
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
        <PageContainer
          ghost
          tabProps={{ size: 'large' }}
          style={{ padding: isMobile ? 0 : undefined }}
          header={{ style: { padding: isMobile ? '8px 0' : undefined } }}
        >
          <style>{`
            /* Tùy chỉnh form tìm kiếm ProTable toàn cục (áp dụng khi chỉ có 1 ô input) */
            .ant-pro-table-search .ant-row {
              display: flex !important;
              flex-wrap: nowrap !important;
              justify-content: center !important; /* Đưa toàn bộ form ra giữa màn hình */
            }
            /* Ẩn các cột đệm trống do grid của ProTable sinh ra */
            .ant-pro-table-search .ant-row > .ant-col:not(:first-child):not(:last-child) {
              display: none !important;
            }
            /* Cột chứa ô nhập liệu */
            .ant-pro-table-search .ant-row > .ant-col:first-child {
              flex: 0 0 400px !important; /* Đặt lại chiều dài cân đối và tối ưu */
              max-width: 110px !important;
              width: 110px !important;
              margin-left: 0 !important;
              padding-right: 0 !important;
            }
            /* Cột chứa các nút hành động (nằm ngay sát ô input) */
            .ant-pro-table-search .ant-row > .ant-col:last-child {
              flex: 0 0 auto !important;
              max-width: none !important;
              width: auto !important;
              text-align: left !important;
              padding-left: 8px !important; /* Khoảng cách siêu nhỏ 8px ngay sát cạnh */
              margin-left: 0 !important; /* Gỡ bỏ lớp offset mặc định đẩy nút ra xa */
            }
            /* Ẩn nút "Đặt lại" */
            .ant-pro-table-search .ant-btn-default {
              display: none !important;
            }
            /* Canh chỉnh lại form item cuối cùng để nút không bị đẩy xuống */
            .ant-pro-table-search .ant-form-item {
              margin-bottom: 0 !important;
            }
            /* Đảm bảo ô input giãn hết chiều ngang của vùng chứa (xóa độ phân giải md/sm mặc định của ProForm) */
            .ant-pro-table-search .ant-form-item-control-input-content > * {
              width: 100% !important;
              max-width: 100% !important;
            }
            /* ── GLOBAL: Tất cả Button thường trong Admin → size large ── */
            .ant-btn:not(.ant-btn-sm):not(.ant-btn-link):not(.ant-btn-text):not(.ant-btn-icon-only) {
              height: 40px !important;
              padding-inline: 16px !important;
              font-size: 14px !important;
              border-radius: 8px !important;
            }
            /* Button link/text giữ nguyên (chỉ cần icon + text nhỏ) */
            .ant-btn-link,
            .ant-btn-text {
              height: auto !important;
            }
          `}</style>
          {children}
        </PageContainer>
      </ProLayout>

      <NotificationDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
      />
    </div>
  );
};

export default AdminLayout;
