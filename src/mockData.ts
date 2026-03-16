
import { Role, Project, Employee, AttendanceRecord, ProjectDetail, WorkdaySettings, AdvanceRequest, AttendanceSummary, ShowcaseProject } from './types';
import dayjs from 'dayjs';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Thi công nội thất căn hộ Vinhome Grand Park',
    address: 'Quận 9, TP.HCM',
    ownerName: 'Nguyễn Văn Nam',
    ownerPhone: '0901234567',
    managerId: '4',
    createdBy: 'Phạm Thị D',
    status: 'Duyệt',
    createdAt: dayjs().subtract(2, 'day').toISOString(),
    details: [
      { id: '1', projectId: '1', name: 'Bàn ăn', material: 'Gỗ sồi tự nhiên', unit: 'Bộ', quantity: 1, price: 15000000, amount: 15000000, costPrice: 12000000, note: 'Bàn tròn 6 ghế' },
      { id: '2', projectId: '1', name: 'Giường ngủ', material: 'Gỗ óc chó', unit: 'Cái', quantity: 2, price: 18000000, amount: 36000000, costPrice: 28000000, note: 'Kèm tủ đầu giường' },
    ],
    progress: [
      { id: 'p1', status: 'Tư vấn + gặp khách + khảo sát', tasks: [{ id: 't1', work: 'Khảo sát hiện trạng căn hộ, Duyệt sơ bộ nhu cầu', employee: 'Nguyễn Văn A', updatedAt: dayjs().subtract(2, 'day').toISOString() }] },
      { id: 'p2', status: 'Lập dự toán ngân sách', tasks: [{ id: 't2', work: 'Gửi báo giá sơ bộ cho khách', employee: 'Trần Thị B', updatedAt: dayjs().subtract(1, 'day').toISOString() }] },
    ]
  },
  {
    id: '2',
    name: 'Nội thất văn phòng Masteri Thảo Điền',
    address: 'Quận 2, TP.HCM',
    ownerName: 'Trần Thị Thuấn',
    ownerPhone: '0912345678',
    managerId: '5',
    createdBy: 'Hoàng Văn E',
    status: 'Chờ duyệt',
    createdAt: dayjs().subtract(10, 'hour').toISOString(),
    details: [
      { id: '6', projectId: '2', name: 'Bàn họp', material: 'Gỗ công nghiệp MDF', unit: 'Cái', quantity: 1, price: 75000000, amount: 75000000, costPrice: 55000000, note: 'MDF phủ veneer sồi' },
    ]
  },
  {
    id: '3',
    name: 'Biệt thự Lucasta (Yêu cầu duyệt)',
    address: 'Quận 9, TP.HCM',
    ownerName: 'Lê Minh Tâm',
    ownerPhone: '0987654321',
    managerId: '4',
    createdBy: 'Phạm Thị D',
    status: 'Chờ duyệt',
    createdAt: dayjs().subtract(5, 'hour').toISOString(),
    details: [],
  },
  {
    id: '4',
    name: 'Căn hộ The Sun Avenue (Yêu cầu duyệt)',
    address: 'Quận 2, TP.HCM',
    ownerName: 'Phạm Hồng Thái',
    ownerPhone: '0933445566',
    managerId: '4',
    createdBy: 'Phạm Thị D',
    status: 'Chờ duyệt',
    createdAt: dayjs().subtract(1, 'hour').toISOString(),
    details: [],
  },
];

// Giữ lại MOCK_PROJECT_DETAILS để tương thích ngược nếu cần, hoặc xóa nếu chắc chắn không dùng
export const MOCK_PROJECT_DETAILS: ProjectDetail[] = MOCK_PROJECTS.flatMap(p => p.details);

export const WORKDAY_SETTINGS: WorkdaySettings = {
  id: '1',
  fullDayHours: 8,
  halfDayHours: 4,
};

export const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Nguyễn Văn A', baseSalary: 500000, bonus: 2000000, penalty: 0, advance: 50000, totalSalary: 12000000 },
  { id: '2', name: 'Trần Thị B', baseSalary: 400000, bonus: 1000000, penalty: 500000, advance: 0, totalSalary: 12500000 },
  { id: '3', name: 'Lê Văn C', baseSalary: 500000, bonus: 500000, penalty: 0, advance: 20000, totalSalary: 8500000 },
  { id: '4', name: 'Phạm Thị D', baseSalary: 500000, bonus: 3000000, penalty: 200000, advance: 1000000, totalSalary: 19800000 },
  { id: '5', name: 'Hoàng Văn E', baseSalary: 800000, bonus: 0, penalty: 100000, advance: 500000, totalSalary: 8400000 },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  // staff 1
  {
    id: '1',
    staffId: '1',
    date: '2024-03-01',
    startTime: '08:00',
    endTime: '17:00',
    workDay: 1,
    otDays: 0,
  },
  {
    id: '2',
    staffId: '1',
    date: '2024-03-02',
    startTime: '08:00',
    endTime: '12:00',
    workDay: 0.5,
    otDays: 0,
  },
  {
    id: '3',
    staffId: '1',
    date: '2024-03-03',
    startTime: '08:00',
    endTime: '20:00',
    workDay: 1,
    otDays: 0.375,
  },

  // staff 2
  {
    id: '4',
    staffId: '2',
    date: '2024-03-01',
    startTime: '08:30',
    endTime: '18:00',
    workDay: 1,
    otDays: 0.125,
  },
  {
    id: '5',
    staffId: '2',
    date: '2024-03-02',
    startTime: '08:00',
    endTime: '17:00',
    workDay: 1,
    otDays: 0,
  },

  // staff 3
  {
    id: '6',
    staffId: '3',
    date: '2024-03-01',
    startTime: '08:00',
    endTime: '18:00',
    workDay: 1,
    otDays: 0.125,
  },
  {
    id: '7',
    staffId: '3',
    date: '2024-03-02',
    startTime: '08:15',
    endTime: '17:00',
    workDay: 1,
    otDays: 0,
  },

  // staff 4
  {
    id: '8',
    staffId: '4',
    date: '2024-03-01',
    startTime: '08:00',
    endTime: '17:00',
    workDay: 1,
    otDays: 0,
  },
  {
    id: '9',
    staffId: '4',
    date: '2024-03-02',
    startTime: '08:00',
    endTime: '19:00',
    workDay: 1,
    otDays: 0.25,
  },
  {
    id: '10',
    staffId: '4',
    date: '2024-03-03',
    startTime: '08:00',
    endTime: '12:00',
    workDay: 0.5,
    otDays: 0,
  },

  // staff 5
  {
    id: '11',
    staffId: '5',
    date: '2024-03-01',
    startTime: '08:00',
    endTime: '19:00',
    workDay: 1,
    otDays: 0.25,
  },
];

export const MOCK_ADVANCE_REQUESTS = [
  {
    id: '1',
    employeeId: '4',
    employeeName: 'Trần Thị B',
    amount: 500000,
    reason: 'Ứng tiền mua đồ dùng',
    requestDate: '2024-03-01T09:00:00',
    status: 'Đã duyệt',
  },
  {
    id: '2',
    employeeId: '4',
    employeeName: 'Trần Thị B',
    amount: 1200000,
    reason: 'Ứng tiền cá nhân',
    requestDate: '2024-03-05T14:30:00',
    status: 'Chờ duyệt',
  },
];

export const MOCK_ATTENDANCE_SUMMARY: AttendanceSummary[] = [
  {
    id: '1',
    staffId: '1',
    staffName: 'Nguyễn Văn A',
    month: '2024-03',
    totalWorkDays: 22,
    totalOTDays: 1.5,
    totalLate: 2,
    records: MOCK_ATTENDANCE.filter(r => r.staffId === '1'),
  },
  {
    id: '2',
    staffId: '2',
    staffName: 'Trần Thị B',
    month: '2024-03',
    totalWorkDays: 23,
    totalOTDays: 1,
    totalLate: 1,
    records: MOCK_ATTENDANCE.filter(r => r.staffId === '2'),
  },
  {
    id: '3',
    staffId: '3',
    staffName: 'Lê Văn C',
    month: '2024-03',
    totalWorkDays: 24,
    totalOTDays: 1.5,
    totalLate: 0,
    records: MOCK_ATTENDANCE.filter(r => r.staffId === '3'),
  },
  {
    id: '4',
    staffId: '4',
    staffName: 'Phạm Thị D',
    month: '2024-03',
    totalWorkDays: 25,
    totalOTDays: 2.5,
    totalLate: 3,
    records: MOCK_ATTENDANCE.filter(r => r.staffId === '4'),
  },
  {
    id: '5',
    staffId: '5',
    staffName: 'Hoàng Văn E',
    month: '2024-03',
    totalWorkDays: 21,
    totalOTDays: 0.625,
    totalLate: 4,
    records: MOCK_ATTENDANCE.filter(r => r.staffId === '5'),
  },
];

export const MOCK_SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: 's1',
    slug: 'biet-thu-vinhomes-harmony',
    title: 'Biệt thự Vinhomes Harmony · Gỗ Óc Chó',
    category: 'Nhà ở',
    coverImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600607687920-4e2a534ab513?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    ],
    location: 'KĐT Vinhomes Harmony, Long Biên, Hà Nội',
    year: '2025',
    area: '320 m²',
    excerpt: 'Không gian sống sang trọng, tận dụng tối đa ánh sáng tự nhiên với chất liệu gỗ óc chó cao cấp, chuẩn mực cho biệt thự hiện đại.',
    content: [
      'Biệt thự Vinhomes Harmony được Hochi thiết kế theo phong cách hiện đại tối giản, tập trung vào sự tinh tế trong từng đường nét và xử lý vật liệu. Gỗ óc chó được sử dụng đồng bộ cho phòng khách, bếp và phòng ngủ, tạo nên một tổng thể thống nhất và đẳng cấp.',
      'Chúng tôi khai thác tối đa chiều cao trần, kết hợp hệ thống đèn gián tiếp và ánh sáng tự nhiên từ hệ cửa kính lớn, giúp không gian luôn thông thoáng, ấm cúng nhưng vẫn sang trọng.',
      'Toàn bộ sản phẩm được sản xuất tại xưởng của Hochi với tiêu chuẩn tẩm sấy nghiêm ngặt, đảm bảo độ bền và tính ổn định của gỗ trong điều kiện khí hậu Việt Nam.',
    ],
  },
  {
    id: 's2',
    slug: 'penthouse-skylake',
    title: 'Penthouse Skylake · Nội thất cao cấp',
    category: 'Thương mại',
    coverImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1617104678098-de229db511aa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&q=80&w=800',
    ],
    location: 'Skylake, Nam Từ Liêm, Hà Nội',
    year: '2024',
    area: '210 m²',
    excerpt: 'Tổ hợp penthouse đẳng cấp với tầm nhìn panorama, tối ưu công năng cho chủ nhân trẻ, yêu thích sự phóng khoáng và hiện đại.',
    content: [
      'Không gian penthouse được tổ chức mở, kết nối liền mạch giữa phòng khách, bếp và khu vực sinh hoạt chung. Vật liệu gỗ, đá tự nhiên và kim loại được phối hợp tinh tế, tạo nên cảm giác sang trọng nhưng không quá phô trương.',
      'Hệ tủ bếp và đảo bếp được thiết kế riêng theo thói quen sử dụng của gia chủ, tích hợp nhiều công năng thông minh, tối ưu không gian lưu trữ.',
      'Khu vực phòng ngủ sử dụng tông màu trầm, kết hợp ánh sáng ấm, giúp gia chủ có không gian nghỉ ngơi yên tĩnh sau những ngày làm việc căng thẳng.',
    ],
  },
  {
    id: 's3',
    slug: 'biet-thu-gamuda',
    title: 'Biệt thự Gamuda · Resort trong lòng phố',
    category: 'Nhà ở',
    coverImage: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1617099404995-0a2b4f66f83e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1586105251261-72a756497a12?auto=format&fit=crop&q=80&w=800',
    ],
    location: 'Gamuda Gardens, Hoàng Mai, Hà Nội',
    year: '2023',
    area: '280 m²',
    excerpt: 'Thiết kế theo concept “resort trong lòng phố” với nhiều mảng xanh, chất liệu gỗ tự nhiên và ánh sáng dịu nhẹ.',
    content: [
      'Điểm nhấn của công trình là không gian phòng khách cao trần với hệ cửa kính lớn, mở rộng tầm nhìn ra sân vườn. Nội thất gỗ được xử lý bề mặt mịn, kết hợp với vải và da cao cấp.',
      'Hochi thiết kế nhiều góc thư giãn nhỏ trong nhà, từ khu đọc sách bên cửa sổ đến quầy bar mini tại khu bếp, giúp gia chủ có thêm trải nghiệm sống trọn vẹn hơn.',
    ],
  },
  {
    id: 's4',
    slug: 'duplex-sunshine-city',
    title: 'Duplex Sunshine City · Không gian hai tầng',
    category: 'Thương mại',
    coverImage: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&q=80&w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800',
    ],
    location: 'Sunshine City, Bắc Từ Liêm, Hà Nội',
    year: '2022',
    area: '190 m²',
    excerpt: 'Không gian duplex với cầu thang trung tâm, tối ưu ánh sáng và tầm nhìn, phù hợp cho gia đình trẻ năng động.',
    content: [
      'Thiết kế tập trung vào sự linh hoạt trong sử dụng không gian, cho phép gia chủ biến đổi công năng theo từng giai đoạn cuộc sống.',
    ],
  },
];
