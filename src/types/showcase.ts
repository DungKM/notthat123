// ─── Showcase Project Types ───

export type ShowcaseProjectCategory = 'Nhà ở' | 'Thương mại' | 'Công nghiệp';

export interface ShowcaseProject {
  id: string;
  slug: string;
  title: string;
  category: ShowcaseProjectCategory;
  coverImage: string;
  gallery?: string[];
  location?: string;
  year?: string;
  area?: string;
  excerpt: string;
  content: string[];
}
