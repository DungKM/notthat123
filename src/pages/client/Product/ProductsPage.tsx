import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const initialSlug = searchParams.get('slug') || searchParams.get('category');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSlug ? [initialSlug] : []);
  const [selectedColors, setSelectedColors] = useState<string>('');
  const [selectedMaterials, setSelectedMaterials] = useState<string>('');

  // Price range
  const MIN_PRICE = 50000;
  const MAX_PRICE = 1000000000;
  const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);
  const [debouncedPrice, setDebouncedPrice] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);

  // Sort & Pagination
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileFilterOpen]);

  const sortOptions = [
    { value: '', label: 'Tùy chọn gợi ý' },
    { value: 'newest', label: 'Hàng mới về' },
    { value: 'price_desc', label: 'Giá: Từ cao tới thấp' },
    { value: 'price_asc', label: 'Giá: Từ thấp tới cao' },
    { value: 'name_asc', label: 'Tên: Từ A - Z' },
    { value: 'name_desc', label: 'Tên: Từ Z - A' }
  ];

  // Scroll đến phần list khi navigate từ mobile menu với hash #danh-sach
  useEffect(() => {
    if (location.hash === '#danh-sach') {
      const timer = setTimeout(() => {
        if (listRef.current) {
          const yOffset = -80;
          const y = listRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { getAll: getCategories } = useCategoryService();
  const { request: productRequest } = useProductService();
  const { request: searchRequest } = useApi<any>('/search');

  // Đồng bộ URL search và danh mục khi URL thay đổi
  useEffect(() => {
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category') || searchParams.get('slug');

    if (searchParam) {
      setSearchQuery(searchParam);
    } else {
      setSearchQuery('');
      setDebouncedSearch('');
    }

    setSelectedCategories(categoryParam ? [categoryParam] : []);
    setCurrentPage(1);
  }, [searchParams]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
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
    const newParams = new URLSearchParams(searchParams);
    const isSelected = selectedCategories.includes(catId);

    if (isSelected) {
      newParams.delete('category');
    } else {
      newParams.set('category', catId);
    }
    newParams.delete('slug'); // Xóa params cũ nếu có

    // Giữ nguyên tham số search nếu đang có
    setSearchParams(newParams);
  };

  const toggleRadio = (item: string, current: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(current === item ? '' : item);
    setCurrentPage(1);
  };

  // ─── useQuery: Danh mục — cache 10 phút, chỉ fetch 1 lần ────────────────
  const { data: apiCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories({ limit: 50 }),
    staleTime: 10 * 60 * 1000,
  });

  // ─── useQuery: Sản phẩm — cache theo filter key ─────────────────────────
  const productQueryKey = [
    'products',
    currentPage,
    selectedCategories.join(','),
    debouncedSearch,
    debouncedPrice[0],
    debouncedPrice[1],
    selectedColors,
    selectedMaterials,
    sortBy,
  ];

  const { data: productData, isFetching: loading } = useQuery({
    queryKey: productQueryKey,
    queryFn: async () => {
      const query: any = { page: currentPage, limit: 12 };

      // Lọc theo danh mục dùng trường categoryId
      if (selectedCategories.length > 0) query.categoryId = selectedCategories.join(',');

      // Tìm kiếm bằng văn bản (có thể kết hợp với categoryId)
      if (debouncedSearch) query.search = debouncedSearch;

      if (debouncedPrice[0] > MIN_PRICE) query.minPrice = debouncedPrice[0];
      if (debouncedPrice[1] < MAX_PRICE) query.maxPrice = debouncedPrice[1];
      if (selectedColors) query.style = selectedColors;
      if (selectedMaterials) query.material = selectedMaterials;
      if (sortBy) query.sort = sortBy;

      const res = await productRequest('GET', '', null, query);
      return { products: res.data || [], meta: res.meta || { page: 1, limit: 12, total: 0, totalPages: 1 } };
    },
    staleTime: 0, // Tắt cache để luôn gọi API mới khi thay đổi param
    placeholderData: (prev) => prev, // Giữ data cũ khi đang load trang mới (không flicker)
  });

  const apiProducts = productData?.products || [];
  const meta = productData?.meta || { page: 1, limit: 12, total: 0, totalPages: 1 };

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
        title="Sản phẩm nội thất gỗ cao cấp - Mua nội thất Hà Nội"
        description="Mua sản phẩm nội thất gỗ cao cấp tại Hà Nội: sofa, giường ngủ, tủ bếp, bàn ăn, kệ TV, tủ quần áo. Chất liệu gỗ óc chó, gỗ MDF. Giao lắp miễn phí. Nội Thất Hochi."
        canonicalPath="/san-pham/danh-sach"
        keywords="mua nội thất, nội thất gỗ cao cấp, sofa nội thất hochi, giường ngủ, tủ bếp, bàn ăn, kệ TV, nội thất hà nội, gỗ óc chó, gỗ MDF, đặt đồ theo yêu cầu"
        breadcrumbs={[
          { name: 'Trang chủ', url: '/' },
          { name: 'Sản phẩm', url: '/san-pham/danh-sach' },
        ]}
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
            <Link to="/" className="!text-white hover:!text-gray-300 transition-colors">Trang chủ</Link>
            <span className="!text-white">/</span>
            <Link to="/san-pham/danh-sach" className="!text-white hover:!text-gray-300 transition-colors">Sản phẩm</Link>
          </div>
        </Container>
      </section>

      {/* Filter + Grid Layout */}
      <section className="py-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] gap-8 xl:gap-12">

            {/* Mobile Filter Overlay */}
            {isMobileFilterOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                onClick={() => setIsMobileFilterOpen(false)}
              />
            )}

            {/* Left Filter Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-[300px] max-w-[85vw] bg-white h-screen flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out lg:sticky lg:top-24 lg:h-fit lg:w-auto lg:bg-transparent lg:overflow-visible lg:transform-none lg:block lg:shadow-none ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
              <div className="flex items-center justify-between p-5 lg:p-0 lg:mb-6 border-b border-gray-100 lg:border-none sticky top-0 bg-white z-10 lg:static">
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-gray-700" />
                  <h2 className="text-xl font-bold text-gray-900 uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Bộ lọc
                  </h2>
                </div>
                <button className="lg:hidden p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto lg:overflow-visible p-5 lg:p-0">
                <div className="bg-white lg:border text-gray-800 border-gray-200 rounded-lg lg:p-5">

                  {/* Search in sidebar */}
                  {/* <div className="mb-6">
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
                </div> */}

                  <FilterSection title="DANH MỤC" defaultOpen={true}>
                    <div className="max-h-[320px]  overflow-y-auto pr-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
                      <CheckboxItem
                        label="TẤT CẢ SẢN PHẨM"
                        checked={selectedCategories.length === 0}
                        onChange={() => { setSelectedCategories([]); setCurrentPage(1); }}
                      />
                      {(apiCategories || []).map((cat: any) => (
                        <React.Fragment key={cat.id || cat._id}>
                          <CheckboxItem
                            label={cat.name}
                            count={cat.productCount}
                            checked={selectedCategories.includes(cat.id || cat._id)}
                            onChange={() => toggleCategory(cat.id || cat._id)}
                          />
                          {cat.children && cat.children.length > 0 && cat.children.map((child: any) => (
                            <div key={child.id || child._id} className="ml-5 mt-1 border-l-[1.5px] pl-4 border-gray-100">
                              <CheckboxItem
                                label={child.name}
                                count={child.productCount}
                                checked={selectedCategories.includes(child.id || child._id)}
                                onChange={() => toggleCategory(child.id || child._id)}
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
                          value={priceRange[0].toLocaleString('vi-VN')}
                          onChange={(e) => {
                            const valStr = e.target.value.replace(/\D/g, '');
                            setPriceRange([valStr ? Number(valStr) : 0, priceRange[1]]);
                          }}
                          className="w-full text-center text-[13px] border border-gray-200 rounded-md py-1.5 px-2 text-gray-700 bg-white focus:outline-none focus:border-showcase-primary transition-all"
                        />
                        <span className="text-gray-400 shrink-0 text-sm">-</span>
                        <input
                          type="text"
                          value={priceRange[1].toLocaleString('vi-VN')}
                          onChange={(e) => {
                            const valStr = e.target.value.replace(/\D/g, '');
                            setPriceRange([priceRange[0], valStr ? Number(valStr) : 0]);
                          }}
                          onBlur={() => {
                            if (priceRange[1] < priceRange[0]) {
                              setPriceRange([priceRange[0], priceRange[0]]);
                            }
                          }}
                          className="w-full text-center text-[13px] border border-gray-200 rounded-md py-1.5 px-2 text-gray-700 bg-white focus:outline-none focus:border-showcase-primary transition-all"
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



                  <FilterSection title="CHẤT LIỆU" defaultOpen={true}>
                    {MOCK_MATERIALS.map((mat) => (
                      <CheckboxItem
                        key={mat}
                        label={mat}
                        checked={selectedMaterials === mat}
                        onChange={() => toggleRadio(mat, selectedMaterials, setSelectedMaterials)}
                      />
                    ))}
                  </FilterSection>

                </div>
              </div>
            </aside>

            {/* Right Content */}
            <div ref={listRef} id="danh-sach">
              {/* Header Right Content (Sort & Title) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-gray-200 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Đồ Nội Thất</h2>
                  <div className="text-sm text-gray-500 font-medium">
                    Hiển thị {meta.total || apiProducts.length} mặt hàng {searchQuery && `cho "${searchQuery}"`}
                  </div>
                </div>

                <div className="flex items-center sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                  <button
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="flex lg:hidden flex-1 sm:flex-none items-center justify-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-[13px] font-medium text-gray-800 transition-all hover:bg-gray-50 shadow-sm"
                  >
                    <Filter className="w-4 h-4" />
                    Lọc
                  </button>

                  <span className="text-[13px] text-gray-600 font-semibold whitespace-nowrap hidden sm:inline-block">Sắp xếp:</span>
                  <div className="relative flex-1 sm:flex-none sm:w-[200px]" ref={sortRef}>
                    <div
                      className="w-full flex items-center justify-between border border-gray-200 text-[13px] font-medium rounded-xl px-4 py-2.5 bg-white cursor-pointer text-gray-800 transition-all hover:bg-gray-50 shadow-sm"
                      onClick={() => setSortOpen(!sortOpen)}
                    >
                      <span className="truncate pr-2 border-r border-gray-200">{sortOptions.find(opt => opt.value === sortBy)?.label || 'Tùy chọn gợi ý'}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {sortOpen && (
                      <div className="absolute top-full right-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                        {sortOptions.map(option => (
                          <div
                            key={option.value}
                            className={`px-4 py-2.5 text-[13px] cursor-pointer transition-colors ${sortBy === option.value ? 'bg-showcase-primary/10 text-showcase-primary font-bold' : 'text-gray-700 hover:bg-[#C5A059] hover:text-white font-medium'}`}
                            onClick={() => {
                              setSortBy(option.value);
                              setCurrentPage(1);
                              setSortOpen(false);
                            }}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                      slug={`${product.slug || product.id}?id=${product.id}`}
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
