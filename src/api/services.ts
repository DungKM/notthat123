/**
 * ─── Model Services ───
 * Mỗi model chỉ cần 1 dòng khai báo.
 * Gọi hook trong component → tự có CRUD + loading + error.
 *
 * VÍ DỤ SỬ DỤNG:
 *
 *   import { useProjectService } from '@/src/api/services';
 *
 *   const MyComponent = () => {
 *     const { list, loading, getAll, create, update, remove } = useProjectService();
 *
 *     useEffect(() => { getAll({ page: 1 }); }, []);
 *
 *     return <Table dataSource={list} loading={loading} />;
 *   };
 */

import { useApi } from '../hooks/useApi';
import type {
  Project,
  Employee,
  AttendanceRecord,
  AdvanceRequest,
  ProjectDetail,
  ShowcaseProject,
  Partner,
  TaskNotification,
} from '@/src/types';

// ─── Auth ───
// Login/logout dùng authService riêng, không qua hook

// ─── Users ───
export const useUserService = () => useApi<any>('/users');

// ─── Projects ───
export const useProjectService = () => useApi<Project>('/projects');

// ─── Notifications ───
export const useNotificationService = () => useApi<TaskNotification>('/notifications');

// ─── Attendance ───
export const useAttendanceService = () => useApi<AttendanceRecord>('/attendance');

// ─── Salary ───
export const useSalaryService = () => useApi<Employee>('/salary/employees');
export const useSalaryActionService = () => useApi<any>('/salary');

// ─── Advance Requests ───
export const useAdvanceService = () => useApi<AdvanceRequest>('/advance-requests');

// ─── Products ───
export const useProductService = () => useApi<any>('/products');

// ─── Categories ───
export const useCategoryService = () => useApi<any>('/categories');

// ─── Orders ───
export const useOrderService = () => useApi<any>('/orders');

// ─── Showcase Projects ───
export const useShowcaseService = () => useApi<ShowcaseProject>('/showcase-projects');

// ─── Partners ───
export const usePartnerService = () => useApi<Partner>('/partners');

// ─── Chat ───
export const useChatGroupService = () => useApi<any>('/chat/groups');
export const useChatMessageService = () => useApi<any>('/chat/messages');

// ─── Upload ───
export const useUploadService = () => useApi<any>('/upload');

// ─── Contacts ───
export const useContactService = () => useApi<any>('/contacts');

//Cart
export const useCartService = () => useApi<any>('/cart');

export const useConstructionService = () => useApi<any>('/constructions');
export const useConstructionCategoryService = () => useApi<any>('/constructions/categories');

export const useApplicationService = () => useApi<any>('/applications');

export const useVideoService = () => useApi<any>('/videos');

// ─── Reviews ───
export const useReviewService = () => useApi<any>('/reviews');

export const useAdvanceRequestService = () => useApi<any>('/advance-requests');

// ─── Project Stages ───
export const useProjectStageService = () => useApi<any>('/project-stages');

// ─── Settings ───
export const useSettingService = () => useApi<any>('/settings');

// ─── Stats ───
export const useStatsService = () => useApi<any>('/stats');


export const useProductCategoryService = () => useApi<any>('/product-categories');

// ─── Production Categories (Hạng mục nội thất) ───
export const useProductionCategoryService = () => useApi<any>('/production-categories');

// ─── Architectures (Thiết kế kiến trúc) ───
export const useArchitectureService = () => useApi<any>('/architectures');
export const useArchitectureCategoryService = () => useApi<any>('/architectures/categories');