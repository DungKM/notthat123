// ─── Advance Request Types ───

export interface AdvanceRequest {
  id: string;
  employeeId: string;
  amount: number;
  reason: string;
  requestDate: string;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối';
  approvedBy?: string;
  approvedDate?: string;
  transferProof?: string;   // URL ảnh chứng từ
  note?: string;
  createdAt?: string;
}
