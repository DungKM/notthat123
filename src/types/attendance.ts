// ─── Attendance Types ───

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  workDay: number;
  otDays: number;
}

export interface AttendanceSummary {
  id: string;
  staffId: string;
  staffName: string;
  month: string;
  totalWorkDays: number;
  totalOTDays: number;
  totalLate: number;
  records: AttendanceRecord[];
}

export interface WorkdaySettings {
  id: string;
  fullDayHours: number;   // Số giờ để tính 1 công
  halfDayHours: number;   // Số giờ để tính 0.5 công
}
