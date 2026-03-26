import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from '@/src/features/showcase/components/ui/Container';
import ProductCard from '@/src/features/showcase/components/ui/ProductCard';
import ProductCardSkeleton from '@/src/features/showcase/components/ui/ProductCardSkeleton';
import SEO from '@/src/components/common/SEO';
import { useCategoryService, useProductService } from '@/src/api/services';
import { useApi } from '@/src/hooks/useApi';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';

const MOCK_MATERIALS = ['Gỗ tự nhiên', 'Gỗ công nghiệp', 'Kim loại', 'Kính', 'Vải/Da', 'Nhựa'];
const MOCK_COLORS = ['Nâu', 'Đen', 'Trắng', 'Kem', 'Xám'];

const FilterSection = ({ title, defaultOpen = true, children }: { title: string, defaultOpen?: boolean, children: React.ReactNode }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0 py-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-bold text-gray-800">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
};

const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSlug = searchParams.get('slug') || searchParams.get('category');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSlug ? [initialSlug] : []);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  // Price range
  const MIN_PRICE = 0;
  const MAX_PRICE = 1000000000;
  const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);
  const [debouncedPrice, setDebouncedPrice] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);

  // Sort & Pagination
  const [sortBy, setSortBy] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const { list: apiCategories, getAll: getCategories } = useCategoryService();
  const { request: productRequest, loading: productLoading } = useProductService();
  const { request: searchRequest, loading: searchLoading } = useApi<any>('/search');
  const loading = debouncedSearch ? searchLoading : productLoading;

  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  // Load danh mục 1 lần khi vào trang
  useEffect(() => {
    getCategories({ limit: 50 });
  }, [getCategories]);

  // Đồng bộ URL search -> selectedCategories khi URL thay đổi
  useEffect(() => {
    const searchParam = searchParams.get('search') || searchParams.get('category');
    setSelectedCategories(searchParam ? [searchParam] : []);
    setCurrentPage(1);
  }, [searchParams]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce price range - 600ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPrice(priceRange);
      setCurrentPage(1);
    }, 600);
    return () => clearTimeout(timer);
  }, [priceRange]);

  // Toggle Selection
  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
    setCurrentPage(1);
  };

  const toggleFilter = (item: string, state: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(state.includes(item) ? state.filter(i => i !== item) : [...state, item]);
    setCurrentPage(1);
  };

  // Load Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (debouncedSearch) {
          // Dùng /search API khi có keyword (giống header)
          const res = await searchRequest('GET', '', null, { keyword: debouncedSearch, limit: 50 });
          let products: any[] = res?.data?.products || [];
          // Lọc thêm theo danh mục nếu đang chọn
          if (selectedCategories.length > 0) {
            products = products.filter((p: any) =>
              selectedCategories.includes(p.categorySlug) ||
              selectedCategories.includes(p.slug) ||
              selectedCategories.includes(p.categoryId?.slug)
            );
          }
          setApiProducts(products);
          setMeta({ page: 1, limit: products.length, total: products.length, totalPages: 1 });
        } else {
          // Không có keyword: gọi API sản phẩm gốc
          const query: any = { page: currentPage, limit: 12 };
          if (selectedCategories.length > 0) query.search = selectedCategories.join(',');
          if (debouncedPrice[0] > MIN_PRICE) query.minPrice = debouncedPrice[0];
          if (debouncedPrice[1] < MAX_PRICE) query.maxPrice = debouncedPrice[1];
          if (selectedColors.length > 0) query.style = selectedColors.join(',');
          if (selectedMaterials.length > 0) query.material = selectedMaterials.join(',');
          if (sortBy) query.sort = sortBy;

          const res = await productRequest('GET', '', null, query);
          setApiProducts(res.data || []);
          if (res.meta) setMeta(res.meta);
        }
      } catch (error) {
        console.error('Failed to fetch products', error);
      }
    };
    fetchProducts();
  }, [currentPage, selectedCategories, debouncedSearch, debouncedPrice, selectedColors, selectedMaterials, sortBy, productRequest]);

  const CheckboxItem = ({ label, count, checked, onChange, isSub = false }: { label: string, count?: number, checked: boolean, onChange: () => void, isSub?: boolean }) => (
    <label className={`flex items-center gap-3 cursor-pointer group mb-1 ${isSub ? 'py-1' : 'py-1.5'}`}>
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
      <div className={`w-[18px] h-[18px] rounded border flex-shrink-0 flex items-center justify-center transition-all duration-300 ${checked ? 'bg-showcase-primary border-showcase-primary shadow-sm shadow-[#c49a0e]/20' : 'border-gray-300 group-hover:border-showcase-primary'}`}>
        {checked && <svg className="w-3.5 h-3.5 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </div>
      <span className={`text-[15px] select-none flex-1 leading-relaxed capitalize transition-all duration-300 ${checked ? 'text-showcase-primary font-semibold tracking-wide' : 'text-gray-600 group-hover:text-gray-900'}`}>{label}</span>
      {count !== undefined && (
        <span className="text-[13px] text-gray-400 group-hover:text-gray-500">
          ({count})
        </span>
      )}
    </label>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Sản phẩm"
        description="Khám phá bộ sưu tập nội thất gỗ óc chó cao cấp của Hochi, từ sofa, bàn ăn đến trọn gói nội thất biệt thự."
      />

      {/* Hero Banner */}
      <section className="relative h-[240px] md:h-[300px] flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600"
            alt="Products Hero"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <Container className="relative z-10 text-center text-white">
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-widest mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>SẢN PHẨM</h1>
          <div className="mt-4 text-sm font-medium opacity-80 flex items-center justify-center gap-2">
            <span>Trang chủ</span>
            <span>/</span>
            <span>Sản phẩm</span>
          </div>
        </Container>
      </section>

      {/* Filter + Grid Layout */}
      <section className="py-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] gap-8 xl:gap-12">

            {/* Left Filter Sidebar */}
            <aside className="lg:sticky lg:top-24 h-fit hidden lg:block">
              <div className="flex items-center gap-3 mb-6">
                <Filter className="w-5 h-5 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-900 uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Bộ lọc
                </h2>
              </div>

              <div className="bg-white border text-gray-800 border-gray-200 rounded-lg p-5">

                {/* Search in sidebar */}
                <div className="mb-6">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Search className="w-4 h-4 text-gray-400 group-focus-within:text-showcase-primary transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-showcase-primary focus:border-showcase-primary transition-all text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                        type="button"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <FilterSection title="DANH MỤC" defaultOpen={true}>
                  <div className="max-h-[320px] overflow-y-auto pr-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
                    <CheckboxItem
                      label="Tất cả sản phẩm"
                      checked={selectedCategories.length === 0}
                      onChange={() => { setSelectedCategories([]); setCurrentPage(1); }}
                    />
                    {(apiCategories || []).map((cat: any) => (
                      <React.Fragment key={cat.id || cat.slug}>
                        <CheckboxItem
                          label={cat.name}
                          count={cat.productCount}
                          checked={selectedCategories.includes(cat.slug)}
                          onChange={() => toggleCategory(cat.slug)}
                        />
                        {cat.children && cat.children.length > 0 && cat.children.map((child: any) => (
                          <div key={child.id || child.slug} className="ml-5 mt-1 border-l-[1.5px] pl-4 border-gray-100">
                            <CheckboxItem
                              label={child.name}
                              count={child.productCount}
                              checked={selectedCategories.includes(child.slug)}
                              onChange={() => toggleCategory(child.slug)}
                              isSub
                            />
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </FilterSection>

                {/* GIÁ Filter */}
                <FilterSection title="GIÁ (VNĐ)" defaultOpen={true}>
                  <div className="pt-1 pb-2">
                    {/* Input row */}
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="text"
                        readOnly
                        value={priceRange[0].toLocaleString('vi-VN')}
                        className="w-full text-center text-[13px] border border-gray-200 rounded-md py-1.5 px-2 text-gray-700 bg-gray-50 focus:outline-none"
                      />
                      <span className="text-gray-400 shrink-0 text-sm">-</span>
                      <input
                        type="text"
                        readOnly
                        value={priceRange[1].toLocaleString('vi-VN')}
                        className="w-full text-center text-[13px] border border-gray-200 rounded-md py-1.5 px-2 text-gray-700 bg-gray-50 focus:outline-none"
                      />
                    </div>

                    {/* Dual range slider */}
                    <div className="relative h-6 flex items-center">
                      {/* Track background */}
                      <div className="absolute w-full h-1 bg-gray-200 rounded-full" />
                      {/* Active track */}
                      <div
                        className="absolute h-1 bg-showcase-primary rounded-full"
                        style={{
                          left: `${(priceRange[0] / MAX_PRICE) * 100}%`,
                          right: `${100 - (priceRange[1] / MAX_PRICE) * 100}%`,
                        }}
                      />
                      {/* Min slider - pointer-events:none on track, all on thumb only */}
                      <input
                        type="range"
                        min={MIN_PRICE}
                        max={MAX_PRICE}
                        step={500_000}
                        value={priceRange[0]}
                        onChange={(e) => {
                          const v = Math.min(Number(e.target.value), priceRange[1] - 500_000);
                          setPriceRange([v, priceRange[1]]);
                        }}
                        className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-showcase-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                        style={{ zIndex: 10 }}
                      />
                      {/* Max slider */}
                      <input
                        type="range"
                        min={MIN_PRICE}
                        max={MAX_PRICE}
                        step={500_000}
                        value={priceRange[1]}
                        onChange={(e) => {
                          const v = Math.max(Number(e.target.value), priceRange[0] + 500_000);
                          setPriceRange([priceRange[0], v]);
                        }}
                        className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-showcase-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                        style={{ zIndex: 10 }}
                      />
                    </div>

                    {/* Min / Max labels */}
                    <div className="flex justify-between mt-3 text-[11px] text-gray-400">
                      <span>{MIN_PRICE.toLocaleString('vi-VN')}</span>
                      <span>{MAX_PRICE.toLocaleString('vi-VN')}</span>
                    </div>

                    {/* Reset button */}
                    {(priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE) && (
                      <button
                        type="button"
                        onClick={() => setPriceRange([MIN_PRICE, MAX_PRICE])}
                        className="mt-3 text-[12px] text-showcase-primary hover:underline"
                      >
                        Xóa lọc giá
                      </button>
                    )}
                  </div>
                </FilterSection>

                <FilterSection title="MÀU SẮC" defaultOpen={true}>
                  {MOCK_COLORS.map((color) => (
                    <CheckboxItem
                      key={color}
                      label={color}
                      checked={selectedColors.includes(color)}
                      onChange={() => toggleFilter(color, selectedColors, setSelectedColors)}
                    />
                  ))}
                </FilterSection>

                <FilterSection title="CHẤT LIỆU" defaultOpen={true}>
                  {MOCK_MATERIALS.map((mat) => (
                    <CheckboxItem
                      key={mat}
                      label={mat}
                      checked={selectedMaterials.includes(mat)}
                      onChange={() => toggleFilter(mat, selectedMaterials, setSelectedMaterials)}
                    />
                  ))}
                </FilterSection>

              </div>
            </aside>

            {/* Right Content */}
            <div>
              {/* Header Right Content (Sort & Title) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-gray-200 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Đồ Nội Thất</h2>
                  <div className="text-sm text-gray-500 font-medium">
                    Hiển thị {meta.total || apiProducts.length} mặt hàng {searchQuery && `cho "${searchQuery}"`}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium whitespace-nowrap hidden sm:inline-block">Sắp xếp theo:</span>
                  <select
                    className="border border-gray-200 text-sm rounded-md px-3 py-2 bg-white outline-none focus:border-showcase-primary cursor-pointer w-[180px] text-gray-700"
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                  >
                    <option value="">Gợi ý</option>
                    <option value="newest">Hàng mới về</option>
                    {/* <option value="soldCount_desc">Hàng bán chạy</option> */}
                    <option value="price_desc">Giá từ cao tới thấp</option>
                    <option value="price_asc">Giá từ thấp tới cao</option>
                    <option value="name_asc">Tên A - Z</option>
                    <option value="name_desc">Tên Z - A</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : apiProducts.length === 0 ? (
                <div className="py-20 text-center text-gray-400">
                  <p className="text-lg">Không tìm thấy sản phẩm nào phù hợp.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
                  {apiProducts.map((product: any, i: number) => (
                    <ProductCard
                      key={product.id || i}
                      basePath="/san-pham"
                      slug={product.slug || product.id}
                      title={product.name}
                      category={product.categoryId?.name}
                      price={product.price && product.price > 0 ? `${product.price.toLocaleString()} VNĐ` : 'Liên hệ'}
                      image={product.images && product.images.length > 0 ? product.images[0].url : 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800'}
                      likes={product.likeCount ?? product.likes}
                      isLiked={product.isLiked}
                    />
                  ))}
                </div>
              )}

              {/* Pagination Placeholder */}
              {meta.totalPages > 1 && (
                <div className="mt-16 flex flex-wrap justify-center items-center gap-2">
                  {(() => {
                    const { totalPages } = meta;
                    let pages: (number | string)[] = [];
                    if (totalPages <= 7) {
                      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                    } else if (currentPage <= 3) {
                      pages = [1, 2, 3, 4, '...', totalPages - 1, totalPages];
                    } else if (currentPage >= totalPages - 2) {
                      pages = [1, 2, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                    } else {
                      pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
                    }

                    return pages.map((p, index) => (
                      <button
                        key={`${p}-${index}`}
                        onClick={() => typeof p === 'number' && setCurrentPage(p)}
                        disabled={typeof p === 'string'}
                        className={`w-10 h-10 flex items-center justify-center rounded-md border font-medium transition-all ${p === currentPage 
                          ? 'bg-showcase-primary text-white border-showcase-primary' 
                          : typeof p === 'string'
                            ? 'bg-transparent border-transparent text-gray-500 cursor-default'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-showcase-primary hover:text-showcase-primary'
                        }`}
                      >
                        {p}
                      </button>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default ProductsPage;
