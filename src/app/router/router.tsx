import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@/src/routes/index';
import ScrollToTop from '@/src/components/common/ScrollToTop';
import PageLoader from '@/src/features/showcase/components/ui/PageLoader';

// Layouts
import ClientLayout from '@/src/layouts/ClientLayout';
import { ProtectedAdminRoute } from '@/src/auth/guards/ProtectedAdminRoute';

// Guards & Types
import { Role } from '@/src/auth/types';
import { useAuth } from '@/src/auth/hooks/useAuth';

// Pages - Client
const PublicHome = lazy(() => import('@/src/pages/client/About/PublicHome'));
const CategoryExplorerPage = lazy(() => import('@/src/pages/client/Product/CategoryExplorerPage'));
const ProductsPage = lazy(() => import('@/src/pages/client/Product/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/src/pages/client/Product/ProductDetailPage'));
const ProjectsPage = lazy(() => import('@/src/pages/client/Project/ProjectsPage'));
const ProjectDetailClientPage = lazy(() => import('@/src/pages/client/Project/ProjectDetailPage'));
const AboutPage = lazy(() => import('@/src/pages/client/About/AboutPage'));
const WhyChooseUsPage = lazy(() => import('@/src/pages/client/About/WhyChooseUsPage'));
const ContactPage = lazy(() => import('@/src/pages/client/Contact/ContactPage'));
const VideoPage = lazy(() => import('@/src/pages/client/VideoPage'));
const RecruitmentPage = lazy(() => import('@/src/pages/client/RecruitmentPage'));
const PartnerPage = lazy(() => import('@/src/pages/client/Partner/PartnerPage'));
const PartnerDetailPage = lazy(() => import('@/src/pages/client/Partner/PartnerDetailPage'));
const CheckoutPage = lazy(() => import('@/src/pages/client/CheckoutPage'));
const LoginPage = lazy(() => import('@/src/pages/auth/LoginPage'));
const SearchResultsPage = lazy(() => import('@/src/pages/client/Search/SearchResultsPage'));

// Pages - Admin
const DashboardPage = lazy(() => import('@/src/pages/admin/dashboard/DashboardPage'));
const ProjectListPage = lazy(() => import('@/src/pages/admin/projects/ProjectListPage'));
const EmployeeManagementPage = lazy(() => import('@/src/pages/admin/hr/EmployeeManagementPage'));
const AdvanceApprovalPage = lazy(() => import('@/src/pages/admin/hr/AdvanceApprovalPage'));
const AttendanceSummaryPage = lazy(() => import('@/src/pages/admin/hr/AttendanceSummaryPage'));
const SalaryManagementPage = lazy(() => import('@/src/pages/admin/hr/SalaryManagementPage'));
const AttendancePage = lazy(() => import('@/src/pages/admin/hr/AttendancePage'));
const PersonalAdvancePage = lazy(() => import('@/src/pages/admin/hr/PersonalAdvancePage'));
const RecruitmentManagementPage = lazy(() => import('@/src/pages/admin/hr/RecruitmentManagementPage'));
const StatisticsPage = lazy(() => import('@/src/pages/admin/reports/StatisticsPage'));
const IncomeStatisticsPage = lazy(() => import('@/src/pages/admin/reports/IncomeStatisticsPage'));
// const ProjectManagementPage = lazy(() => import('@/src/pages/admin/projects/ProjectManagementPage'));
const ProjectDetailPage = lazy(() => import('@/src/pages/admin/projects/ProjectDetailPage'));
const UsersPage = lazy(() => import('@/src/pages/admin/crm/UsersPage'));
const OrderManagementPage = lazy(() => import('@/src/pages/admin/ecommerce/OrderManagementPage'));
const ProductManagementPage = lazy(() => import('@/src/pages/admin/ecommerce/ProductManagementPage'));
const CategoryManagementPage = lazy(() => import('@/src/pages/admin/ecommerce/CategoryManagementPage'));
const CategoryProjectManagementPage = lazy(() => import('@/src/pages/admin/ecommerce/CategoryProjectManagementPage'));
const ContactManagementPage = lazy(() => import('@/src/pages/admin/crm/ContactManagementPage'));
const ChatPage = lazy(() => import('@/src/pages/admin/chat/ChatPage'));
const ShowcaseProjectManagementPage = lazy(() => import('@/src/pages/admin/ecommerce/ShowcaseProjectManagementPage'));
const PartnerManagementPage = lazy(() => import('@/src/pages/admin/crm/PartnerManagementPage'));
const VideoManagementPage = lazy(() => import('@/src/pages/admin/marketing/VideoManagementPage'));
const ReviewManagementPage = lazy(() => import('@/src/pages/admin/ecommerce/ReviewManagementPage'));
const ProjectStagesPage = lazy(() => import('@/src/pages/admin/projects/ProjectStagesPage'));

const Unauthorized = () => (
  <div style={{ padding: 50, textAlign: 'center' }}>
    <h2>403 - Bạn không có quyền truy cập trang này</h2>
  </div>
);

const AppRouter: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Showcase Routes (wrapped in ClientLayout) */}
          <Route element={<ClientLayout />}>
            <Route path={ROUTES.TRANG_CHU} element={<PublicHome />} />
            <Route path={ROUTES.SAN_PHAM} element={<CategoryExplorerPage />} />
            <Route path={ROUTES.DANH_SACH_SAN_PHAM} element={<ProductsPage />} />
            <Route path={ROUTES.CHI_TIET_SAN_PHAM} element={<ProductDetailPage />} />
            <Route path={ROUTES.CONG_TRINH} element={<ProjectsPage />} />
            <Route path={ROUTES.CHI_TIET_CONG_TRINH} element={<ProjectDetailClientPage />} />
            <Route path={ROUTES.GIOI_THIEU} element={<AboutPage />} />
            <Route path={ROUTES.VI_SAO_CHON_CHUNG_TOI} element={<WhyChooseUsPage />} />
            <Route path={ROUTES.LIEN_HE} element={<ContactPage />} />
            <Route path={ROUTES.VIDEO} element={<VideoPage />} />
            <Route path={ROUTES.TUYEN_DUNG} element={<RecruitmentPage />} />
            <Route path={ROUTES.DOI_TAC} element={<PartnerPage />} />
            <Route path={ROUTES.CHI_TIET_DOI_TAC} element={<PartnerDetailPage />} />
            <Route path={ROUTES.THANH_TOAN} element={<CheckoutPage />} />
            <Route path={ROUTES.TIM_KIEM} element={<SearchResultsPage />} />
          </Route>

          {/* Special Routes (No Layout) */}
          <Route path={ROUTES.DANG_NHAP} element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin Routes (wrapped in ProtectedAdminRoute which includes AdminLayout) */}

          {/* Dashboard */}
          <Route
            path={ROUTES.ADMIN_TONG_QUAN}
            element={
              <ProtectedAdminRoute roles={[Role.DIRECTOR, Role.ACCOUNTANT]}>
                <DashboardPage />
              </ProtectedAdminRoute>
            }
          />

          {/* Projects Admin */}
          <Route
            path={ROUTES.ADMIN_CONG_TRINH}
            element={
              <ProtectedAdminRoute roles={[Role.DIRECTOR, Role.ACCOUNTANT, Role.SITE_MANAGER, Role.STAFF]}>
                <ProjectListPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_CHI_TIET_CONG_TRINH}
            element={
              <ProtectedAdminRoute roles={[Role.DIRECTOR, Role.ACCOUNTANT, Role.SITE_MANAGER, Role.STAFF]}>
                <ProjectDetailPage />
              </ProtectedAdminRoute>
            }
          />

          {/* Accounting Modules */}
          <Route
            path={ROUTES.ADMIN_NHAN_VIEN}
            element={
              <ProtectedAdminRoute roles={[Role.ACCOUNTANT, Role.DIRECTOR]}>
                <EmployeeManagementPage currentUser={user!} />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_DUYET_UNG_TIEN}
            element={
              <ProtectedAdminRoute roles={[Role.ACCOUNTANT, Role.DIRECTOR]}>
                <AdvanceApprovalPage currentUser={user!} />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_TONG_HOP_CHAM_CONG}
            element={
              <ProtectedAdminRoute roles={[Role.ACCOUNTANT, Role.DIRECTOR]}>
                <AttendanceSummaryPage currentUser={user!} />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_QUAN_LY_LUONG}
            element={
              <ProtectedAdminRoute roles={[Role.ACCOUNTANT, Role.DIRECTOR]}>
                <SalaryManagementPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_NGUOI_DUNG}
            element={
              <ProtectedAdminRoute roles={[Role.ACCOUNTANT, Role.DIRECTOR]}>
                <UsersPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_DON_HANG}
            element={
              <ProtectedAdminRoute roles={[Role.ACCOUNTANT, Role.DIRECTOR]}>
                <OrderManagementPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_SAN_PHAM}
            element={
              <ProtectedAdminRoute roles={[Role.ACCOUNTANT, Role.DIRECTOR]}>
                <ProductManagementPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_DANH_MUC}
            element={
              <ProtectedAdminRoute roles={[Role.ACCOUNTANT, Role.DIRECTOR]}>
                <CategoryManagementPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_DANH_MUC_CONG_TRINH}
            element={
              <ProtectedAdminRoute roles={[Role.ACCOUNTANT, Role.DIRECTOR]}>
                <CategoryProjectManagementPage />
              </ProtectedAdminRoute>
            }
          />


          <Route
            path={ROUTES.ADMIN_QUAN_LY_TUYEN_DUNG}
            element={
              <ProtectedAdminRoute roles={[Role.ACCOUNTANT, Role.DIRECTOR]}>
                <RecruitmentManagementPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_QUAN_LY_LIEN_HE}
            element={
              <ProtectedAdminRoute roles={[Role.ACCOUNTANT, Role.DIRECTOR]}>
                <ContactManagementPage />
              </ProtectedAdminRoute>
            }
          />

          {/* Sales Modules */}

          {/* <Route
            path={ROUTES.ADMIN_CONG_TRINH}
            element={
              <ProtectedAdminRoute roles={[Role.DIRECTOR, Role.ACCOUNTANT, Role.SITE_MANAGER]}>
                <ProjectManagementPage />
              </ProtectedAdminRoute>
            }
          /> */}
          <Route
            path={ROUTES.ADMIN_SHOWCASE_PROJECTS}
            element={
              <ProtectedAdminRoute roles={[Role.DIRECTOR, Role.ACCOUNTANT]}>
                <ShowcaseProjectManagementPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_QUAN_LY_DOI_TAC}
            element={
              <ProtectedAdminRoute roles={[Role.DIRECTOR, Role.ACCOUNTANT]}>
                <PartnerManagementPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_VIDEO}
            element={
              <ProtectedAdminRoute roles={[Role.DIRECTOR, Role.ACCOUNTANT]}>
                <VideoManagementPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_DANH_GIA}
            element={
              <ProtectedAdminRoute roles={[Role.DIRECTOR, Role.ACCOUNTANT]}>
                <ReviewManagementPage />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path={ROUTES.ADMIN_DANH_MUC_TIEN_DO}
            element={
              <ProtectedAdminRoute roles={[Role.DIRECTOR, Role.ACCOUNTANT]}>
                <ProjectStagesPage />
              </ProtectedAdminRoute>
            }
          />

          {/* Site Manager Modules */}


          {/* Common Staff Modules */}
          <Route
            path={ROUTES.ADMIN_CHAM_CONG_CA_NHAN}
            element={<Navigate to={ROUTES.ADMIN_THONG_KE} replace />}
          />
          <Route
            path={ROUTES.ADMIN_YEU_CAU_UNG_TIEN}
            element={
              <ProtectedAdminRoute roles={[Role.SITE_MANAGER, Role.STAFF, Role.ACCOUNTANT, Role.DIRECTOR]}>
                <PersonalAdvancePage currentUser={user!} />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_THONG_KE}
            element={
              <ProtectedAdminRoute roles={[Role.SITE_MANAGER, Role.STAFF]}>
                <StatisticsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_THONG_KE_THU_NHAP}
            element={
              <ProtectedAdminRoute roles={[Role.SITE_MANAGER, Role.STAFF]}>
                <IncomeStatisticsPage />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path={ROUTES.TRO_CHUYEN}
            element={
              <ProtectedAdminRoute roles={[Role.DIRECTOR, Role.ACCOUNTANT, Role.SITE_MANAGER, Role.STAFF, Role.CUSTOMER]}>
                <ChatPage />
              </ProtectedAdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default AppRouter;