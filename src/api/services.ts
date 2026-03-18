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

// ─── Upload ───
export const useUploadService = () => useApi<any>('/upload');

//Cart
export const useCartService = () => useApi<any>('/cart');
