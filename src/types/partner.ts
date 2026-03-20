// ─── Partner Types ───

export interface Partner {
  id: string;
  slug: string;
  cooperationYear: number;
  title: string;
  brandName?: string;
  description?: string;
  images?: Array<{ url: string; sortOrder?: number; id?: string }>;
  content?: string;
}
