import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from '@/src/features/showcase/components/ui/Container';
import ProductCard from '@/src/features/showcase/components/ui/ProductCard';
import SEO from '@/src/components/common/SEO';
import { useCategoryService, useProductService } from '@/src/api/services';
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
  
  // Sort & Pagination
  const [sortBy, setSortBy] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const { list: apiCategories, getAll: getCategories } = useCategoryService();
  const { request: productRequest, loading } = useProductService();

  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  // Load danh mục 1 lần khi vào trang
  useEffect(() => {
    getCategories({ limit: 50 });
  }, [getCategories]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
        const query: any = { page: currentPage, limit: 12 };
        if (selectedCategories.length > 0) query.slug = selectedCategories.join(',');
        if (debouncedSearch) query.search = debouncedSearch;
        
        // Them cac param filter nếu backend hỗ trợ 
        if (selectedColors.length > 0) query.style = selectedColors.join(',');
        if (selectedMaterials.length > 0) query.material = selectedMaterials.join(',');
        
        // Them param sort
        if (sortBy) query.sort = sortBy;

        const res = await productRequest('GET', '', null, query);
        setApiProducts(res.data || []);
        if (res.meta) {
          setMeta(res.meta);
        }
      } catch (error) {
        console.error('Failed to fetch products', error);
      }
    };
    fetchProducts();
  }, [currentPage, selectedCategories, debouncedSearch, selectedColors, selectedMaterials, sortBy, productRequest]);

  const CheckboxItem = ({ label, count, checked, onChange }: { label: string, count?: number, checked: boolean, onChange: () => void }) => (
    <label className="flex items-center gap-3 cursor-pointer group mb-3 last:mb-0">
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-showcase-primary border-showcase-primary' : 'border-gray-300 group-hover:border-showcase-primary'}`}>
        {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </div>
      <span className={`text-sm select-none flex-1 ${checked ? 'text-showcase-primary font-medium' : 'text-gray-600'}`}>{label}</span>
      {count !== undefined && <span className="text-xs text-gray-400">({count})</span>}
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
                  <div className="max-h-60 overflow-y-auto pr-1">
                     <CheckboxItem 
                        label="Tất cả sản phẩm" 
                        checked={selectedCategories.length === 0}
                        onChange={() => { setSelectedCategories([]); setCurrentPage(1); }}
                      />
                    {(apiCategories || []).map((cat: any) => (
                      <React.Fragment key={cat.id || cat.slug}>
                        <CheckboxItem 
                          label={cat.name} 
                          checked={selectedCategories.includes(cat.slug)}
                          onChange={() => toggleCategory(cat.slug)}
                        />
                        {cat.children && cat.children.length > 0 && cat.children.map((child: any) => (
                          <div key={child.id || child.slug} className="ml-5 border-l-2 pl-3 border-gray-100">
                            <CheckboxItem 
                              label={child.name} 
                              checked={selectedCategories.includes(child.slug)}
                              onChange={() => toggleCategory(child.slug)}
                            />
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
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
                <div className="py-20 text-center text-gray-400">
                  <p className="text-lg animate-pulse">Đang tải sản phẩm...</p>
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
                    />
                  ))}
                </div>
              )}

              {/* Pagination Placeholder */}
              {meta.totalPages > 1 && (
                <div className="mt-16 flex justify-center gap-2">
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-10 h-10 flex items-center justify-center rounded-md border font-medium transition-all ${p === currentPage ? 'bg-showcase-primary text-white border-showcase-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-showcase-primary hover:text-showcase-primary'}`}
                    >
                      {p}
                    </button>
                  ))}
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
