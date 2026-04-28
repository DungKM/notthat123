export interface ProductImage {
  url: string;
  id?: string;
  _id?: string;
  description?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  slug?: string;
  price: number;
  stockQuantity?: number;
  description?: string;
  warranty?: string;
  style?: string;
  material?: string;
  size?: string[];
  createdAt?: string;
  categoryId?: {
    id: string;
    name: string;
  } | string;
  images?: ProductImage[] | string[];
}

export interface CategoryItem {
  id: string;
  name: string;
  children?: CategoryItem[];
  _id?: string;
}
