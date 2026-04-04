// ─── Shared Item Category Data ───────────────────────────────────────────────
// File này dùng chung cho cả ItemCategoryManagementPage và ProjectDetailTable
// Khi có API thật, thay thế bằng fetch từ server

export interface ItemVariant {
  id: string;
  label: string;         // Tên ngắn: "Loại 1.6m", "Gỗ tự nhiên premium"
  description?: string;  // Chất liệu chi tiết
  dimensions?: string;   // DxRxC mm
  price?: number;        // Đơn giá VNĐ
  unit?: string;         // Override đơn vị nếu khác item cha
}

export interface ItemCategory {
  _id: string;
  id: string;
  name: string;
  description?: string;  // Mô tả chung (khi không có variants)
  unit?: string;
  dimensions?: string;   // Kích thước (khi không có variants)
  price?: number;        // Đơn giá (khi không có variants)
  parentId?: string | null;
  priority?: number;
  children?: ItemCategory[];
  createdAt?: string;
  variants?: ItemVariant[]; // Các biến thể (loại) của hạng mục con
}

export const ITEM_CATEGORIES_MOCK: ItemCategory[] = [
  {
    _id: '1', id: '1',
    name: 'Nội thất phòng ngủ',
    description: 'Giường, tủ, bàn trang điểm và đồ nội thất phòng ngủ cao cấp',
    unit: undefined, parentId: null, priority: 0,
    createdAt: '2024-01-10T00:00:00Z',
    children: [
      {
        _id: '1-1', id: '1-1', name: 'Giường ngủ',
        unit: 'Chiếc', parentId: '1', priority: 0, createdAt: '2024-01-11T00:00:00Z', children: [],
        variants: [
          { id: '1-1-v1', label: 'Loại 1.6m - Gỗ MDF', description: 'Gỗ MDF xanh chống ẩm phủ Melamin màu ghi đậm', dimensions: '1600x2000x950', price: 4800000 },
          { id: '1-1-v2', label: 'Loại 1.8m - Gỗ MDF', description: 'Gỗ MDF xanh chống ẩm phủ Melamin màu ghi đậm', dimensions: '1800x2000x950', price: 5500000 },
          { id: '1-1-v3', label: 'Loại 1.8m - Gỗ tự nhiên', description: 'Gỗ sồi tự nhiên nhập khẩu, sơn PU cao cấp bóng', dimensions: '1800x2000x950', price: 12000000 },
        ],
      },
      {
        _id: '1-2', id: '1-2', name: 'Tab ngăn kéo',
        description: 'Gỗ MDF xanh chống ẩm phủ Melamin màu ghi đậm', dimensions: '400x500x615', price: 850000, unit: 'Chiếc', parentId: '1', priority: 1, createdAt: '2024-01-12T00:00:00Z', children: [],
      },
      {
        _id: '1-3', id: '1-3', name: 'Bàn trang điểm',
        description: 'Gỗ MDF xanh chống ẩm phủ Melamin màu ghi đậm', dimensions: '1200x500x130', price: 1550000, unit: 'Chiếc', parentId: '1', priority: 2, createdAt: '2024-01-13T00:00:00Z', children: [],
      },
      {
        _id: '1-4', id: '1-4', name: 'Gương trang điểm',
        description: 'Gương tròn có led hắt sáng mặt dạng treo dây', dimensions: '600x800', price: 720000, unit: 'Chiếc', parentId: '1', priority: 3, createdAt: '2024-01-14T00:00:00Z', children: [],
      },
      {
        _id: '1-5', id: '1-5', name: 'Tủ áo',
        unit: 'm2', parentId: '1', priority: 4, createdAt: '2024-01-15T00:00:00Z', children: [],
        variants: [
          { id: '1-5-v1', label: 'Tủ 2 cánh - Gỗ MDF', description: 'Gỗ MDF xanh chống ẩm phủ Melamin màu ghi đậm', dimensions: '1200x600x2200', price: 8500000, unit: 'Chiếc' },
          { id: '1-5-v2', label: 'Tủ 3 cánh - Gỗ MDF', description: 'Gỗ MDF xanh chống ẩm phủ Melamin màu ghi đậm', dimensions: '1800x600x2200', price: 12000000, unit: 'Chiếc' },
          { id: '1-5-v3', label: 'Tủ âm tường - Theo m2', description: 'Gỗ MDF xanh cánh kính cường lực mờ', dimensions: undefined, price: 2200000, unit: 'm2' },
        ],
      },
    ],
  },
  {
    _id: '2', id: '2',
    name: 'Nội thất phòng khách',
    description: 'Sofa, bàn trà, kệ tivi và đồ nội thất phòng khách',
    unit: undefined, parentId: null, priority: 1,
    createdAt: '2024-01-20T00:00:00Z',
    children: [
      {
        _id: '2-1', id: '2-1', name: 'Sofa góc chữ L',
        unit: 'Bộ', parentId: '2', priority: 0, createdAt: '2024-01-21T00:00:00Z', children: [],
        variants: [
          { id: '2-1-v1', label: 'Vải nhung - 2m6', description: 'Khung gỗ tự nhiên, bọc vải nhung cao cấp', dimensions: '2600x1600', price: 18000000 },
          { id: '2-1-v2', label: 'Da PU - 2m6', description: 'Khung gỗ tự nhiên, bọc da PU cao cấp', dimensions: '2600x1600', price: 22000000 },
          { id: '2-1-v3', label: 'Da thật - 2m6', description: 'Khung gỗ tự nhiên, bọc da bò thật nhập khẩu', dimensions: '2600x1600', price: 38000000 },
        ],
      },
      { _id: '2-2', id: '2-2', name: 'Bàn trà', description: 'Mặt kính cường lực, chân inox mạ vàng', price: 3200000, unit: 'Chiếc', parentId: '2', priority: 1, createdAt: '2024-01-22T00:00:00Z', children: [] },
      { _id: '2-3', id: '2-3', name: 'Kệ tivi', description: 'Gỗ công nghiệp An Cường, sơn PU trắng bóng', price: 4500000, unit: 'Chiếc', parentId: '2', priority: 2, createdAt: '2024-01-23T00:00:00Z', children: [] },
    ],
  },
  {
    _id: '3', id: '3',
    name: 'Nội thất phòng bếp',
    description: 'Tủ bếp, đảo bếp và thiết bị bếp',
    unit: undefined, parentId: null, priority: 2,
    createdAt: '2024-02-01T00:00:00Z',
    children: [
      {
        _id: '3-1', id: '3-1', name: 'Tủ bếp trên',
        unit: 'm2', parentId: '3', priority: 0, createdAt: '2024-02-02T00:00:00Z', children: [],
        variants: [
          { id: '3-1-v1', label: 'Cánh Acrylic bóng', description: 'Cánh Acrylic bóng, chống ẩm, dễ vệ sinh', price: 2200000 },
          { id: '3-1-v2', label: 'Cánh Melamine mờ', description: 'Cánh Melamine chống ẩm, bề mặt mờ hiện đại', price: 1800000 },
        ],
      },
      {
        _id: '3-2', id: '3-2', name: 'Tủ bếp dưới',
        unit: 'm2', parentId: '3', priority: 1, createdAt: '2024-02-03T00:00:00Z', children: [],
        variants: [
          { id: '3-2-v1', label: 'Cánh Acrylic bóng', description: 'Khung tủ Melamine chống ẩm, ray âm 45kg, cánh Acrylic', price: 2500000 },
          { id: '3-2-v2', label: 'Cánh Melamine mờ', description: 'Khung tủ Melamine chống ẩm, ray âm 45kg, cánh Melamine', price: 2000000 },
        ],
      },
      { _id: '3-3', id: '3-3', name: 'Đảo bếp', description: 'Mặt đá tự nhiên Marble, chân sắt sơn tĩnh điện', price: 8500000, unit: 'Chiếc', parentId: '3', priority: 2, createdAt: '2024-02-04T00:00:00Z', children: [] },
    ],
  },
  {
    _id: '4', id: '4',
    name: 'Hạng mục khác',
    description: 'Sàn gỗ, phào chỉ và các hạng mục hoàn thiện khác',
    unit: undefined, parentId: null, priority: 3,
    createdAt: '2024-02-10T00:00:00Z',
    children: [
      { _id: '4-1', id: '4-1', name: 'Sàn gỗ', description: 'Sàn gỗ công nghiệp chống ẩm cao cấp', price: 350000, unit: 'm2', parentId: '4', priority: 0, createdAt: '2024-02-11T00:00:00Z', children: [] },
      { _id: '4-2', id: '4-2', name: 'Phào nẹp kết thúc', description: 'Phào nẹp nhựa kết thúc', price: 45000, unit: 'md', parentId: '4', priority: 1, createdAt: '2024-02-12T00:00:00Z', children: [] },
      { _id: '4-3', id: '4-3', name: 'Trần thạch cao', description: 'Trần phẳng khung xương chìm 300x300', price: 180000, unit: 'm2', parentId: '4', priority: 2, createdAt: '2024-02-13T00:00:00Z', children: [] },
    ],
  },
];

// Lấy tất cả hạng mục CON (flat), mỗi item có thể có variants
export const getAllChildCategories = (): ItemCategory[] =>
  ITEM_CATEGORIES_MOCK.flatMap(p => p.children || []);

// Grouped cho Select
export const getCategoriesGrouped = (): { label: string; options: ItemCategory[] }[] =>
  ITEM_CATEGORIES_MOCK.map(p => ({ label: p.name, options: p.children || [] }));

// Lấy min price từ variants hoặc price trực tiếp
export const getMinPrice = (item: ItemCategory): number | undefined => {
  if (item.variants && item.variants.length > 0) {
    const prices = item.variants.map(v => v.price ?? 0);
    return Math.min(...prices);
  }
  return item.price;
};
