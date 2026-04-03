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
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, hasMore, loadMore } = useNotifications(user?.id);
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
        { path: ROUTES.ADMIN_HANG_MUC, name: 'Quản lý hạng mục', icon: <TagsOutlined /> },
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
              <Space style={{ cursor: 'pointer' }}>
                {dom}
                <Tag color="green" className="hidden-mobile" style={{ margin: 0 }}>
                  {user?.role === Role.DIRECTOR ? 'Giám đốc' :
                    user?.role === Role.ACCOUNTANT ? 'Kế toán' :
                      user?.role === Role.SITE_MANAGER ? 'Quản lý công trình' :
                        user?.role === Role.STAFF ? 'Nhân viên' : user?.role}
                </Tag>
              </Space>
            </Dropdown>
          ),
        }}
        actionsRender={() => [
          <ReloadOutlined
            key="reload"
            style={{ fontSize: 22, cursor: 'pointer', color: '#666' }}
            title="Tải lại trang"
            onClick={() => window.location.reload()}
          />,
          <Badge key="notif" count={unreadCount} size="default" offset={[2, 2]} style={{ overflow: 'visible' }}>
            <BellOutlined
              style={{ fontSize: 22, cursor: 'pointer' }}
              onClick={() => setNotifOpen(true)}
            />
          </Badge>,
        ]}
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
            /* ── ProTable search: chỉ layout gọn trên desktop ── */
            @media (min-width: 769px) {
              .ant-pro-table-search .ant-row {
                display: flex !important;
                flex-wrap: nowrap !important;
                justify-content: center !important;
              }
              .ant-pro-table-search .ant-row > .ant-col:not(:first-child):not(:last-child) {
                display: none !important;
              }
              .ant-pro-table-search .ant-row > .ant-col:first-child {
                flex: 0 0 400px !important;
                max-width: 110px !important;
                width: 110px !important;
                margin-left: 0 !important;
                padding-right: 0 !important;
              }
              .ant-pro-table-search .ant-row > .ant-col:last-child {
                flex: 0 0 auto !important;
                max-width: none !important;
                width: auto !important;
                text-align: left !important;
                padding-left: 8px !important;
                margin-left: 0 !important;
              }
            }
            /* Ẩn nút "Đặt lại" trên mọi thiết bị */
            .ant-pro-table-search .ant-btn-default {
              display: none !important;
            }
            /* Form item không có margin thừa */
            .ant-pro-table-search .ant-form-item {
              margin-bottom: 0 !important;
            }
            .ant-pro-table-search .ant-form-item-control-input-content > * {
              width: 100% !important;
              max-width: 100% !important;
            }
            /* ── Mobile: search form stack dọc, full width ── */
            @media (max-width: 768px) {
              .ant-pro-table-search .ant-row {
                flex-wrap: wrap !important;
              }
              .ant-pro-table-search .ant-row > .ant-col {
                display: block !important;
                flex: 0 0 100% !important;
                max-width: 100% !important;
                width: 100% !important;
                padding: 0 !important;
                margin: 0  !important;
              }
              .ant-pro-table-search .ant-row > .ant-col:last-child {
                margin-bottom: 0 !important;
              }
            /* ── Fix: Badge thông báo luôn hiển thị trên mobile ── */
            .ant-pro-layout .ant-pro-layout-header-actions-header-action,
            .ant-pro-layout .ant-pro-global-header .ant-space,
            .ant-pro-layout .ant-pro-global-header-header-actions-avatar {
              overflow: visible !important;
            }
            .ant-badge {
              overflow: visible !important;
            }
            .ant-badge .ant-badge-count {
              z-index: 99 !important;
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
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  );
};

export default AdminLayout;
