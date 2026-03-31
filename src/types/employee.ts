// ─── Employee / Salary Types ───

export interface Employee {
  id: string;
  name: string;
  role: string;
  baseSalary: number;
  bonus: number;
  penalty: number;
  advance: number;
  totalSalary: number;
  currentAmount: number;
}
