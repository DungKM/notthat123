import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCategoryService } from '@/src/api/services';
import { useApi } from '@/src/hooks/useApi';
import Container from '@/src/features/showcase/components/ui/Container';
import { ArrowRightOutlined, SearchOutlined, FilterOutlined, InboxOutlined } from '@ant-design/icons';
import { ROUTES } from '@/src/routes';

export const MOCK_PRODUCT_PLACEHOLDER = 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&q=80&w=800';

// Chỉ cho phép: chữ cái (bao gồm tiếng Việt), số, khoảng trắng, dấu gạch ngang, dấu phẩy, chấm
const ALLOWED_CHARS_REGEX = /[^\p{L}\p{N}\s\-,.']/gu;
const sanitizeInput = (value: string): string =>
  value.replace(ALLOWED_CHARS_REGEX, '').replace(/\s{2,}/g, ' ');

interface SearchProduct {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  image?: string;
}

interface SearchResult {
  products: SearchProduct[];
}

const CategoryExplorerPage = () => {
  const { list: apiCategories, getAll } = useCategoryService();
  const { request: searchRequest } = useApi<SearchResult>('/search');
  const navigate = useNavigate();
  const [activeParentId, setActiveParentId] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');

  // Search state
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getAll({ limit: 100 });
  }, []);

  const parentCategories = apiCategories ? apiCategories.filter(cat => !cat.parentSlug) : [];

  // Set default active parent category
  useEffect(() => {
    if (parentCategories.length > 0 && !activeParentId) {
      setActiveParentId(parentCategories[0].id || parentCategories[0]._id);
    }
  }, [parentCategories, activeParentId]);

  const activeParent = parentCategories.find(cat => (cat.id || cat._id) === activeParentId);
  const allChildren = activeParent?.children || [];

  // ─── Search API call ───
  const doSearch = useCallback(async (kw: string) => {
    if (!kw.trim()) {
      setSearchResults([]);
      setSearched(false);
      setKeyword('');
      return;
    }
    setIsSearching(true);
    setSearched(false);
    setKeyword(kw.trim());
    try {
      const res = await searchRequest('GET', '', null, { keyword: kw.trim(), limit: 8 });
      const data = (res as any)?.data || res || {};
      setSearchResults(Array.isArray(data.products) ? data.products : []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      setSearched(true);
    }
  }, [searchRequest]);

  // Submit form (Enter or click button)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    doSearch(inputValue);
  };

  // Clear search and go back to category browsing
  const handleReset = () => {
    setInputValue('');
    setKeyword('');
    setSearchResults([]);
    setSearched(false);
    if (parentCategories.length > 0) {
      setActiveParentId(parentCategories[0].id || parentCategories[0]._id);
    }
  };

  // Determine what to show on right panel
  const isInSearchMode = searched || isSearching;

  return (
    <div className="bg-stone-50 min-h-screen">
      <section className="relative h-[240px] md:h-[300px] flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80"
            alt="Category Hero"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <Container className="relative z-10 text-center text-white">
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-widest mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>KHÁM PHÁ DANH MỤC</h1>
          <div className="mt-4 text-sm font-medium opacity-80 flex items-center justify-center gap-2">
            <span>Tìm kiếm hàng ngàn sản phẩm nội ngoại thất cao cấp được phân loại rõ ràng.</span>
          </div>
        </Container>
      </section>

      <Container className="py-16 md:py-24">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          {/* Sidebar Left: Filter Panel */}
          <div className="w-full md:w-1/4 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100  p-6 sticky top-24">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Tìm kiếm</p>
                  <h2 className="text-xl font-black text-gray-900 mt-0.5">BỘ LỌC</h2>
                </div>
                <button
                  onClick={handleReset}
                  title="Đặt lại bộ lọc"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-showcase-primary hover:bg-amber-50 transition-colors"
                >
                  <FilterOutlined />
                </button>
              </div>

              {/* Keyword Search */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Từ khóa</label>
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(sanitizeInput(e.target.value))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (debounceRef.current) clearTimeout(debounceRef.current);
                          doSearch(inputValue);
                        }
                      }}
                      placeholder="Tìm kiếm sản phẩm..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl transition-colors flex items-center justify-center"
                    title="Tìm kiếm"
                  >
                    <SearchOutlined />
                  </button>
                </form>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 mb-5" />

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Danh mục</label>
                <div className="flex flex-col gap-2">
                  {parentCategories.map(cat => {
                    const catId = cat.id || cat._id;
                    const isActive = activeParentId === catId && !isInSearchMode;
                    return (
                      <button
                        key={catId}
                        onClick={() => {
                          setActiveParentId(catId);
                          setInputValue('');
                          setKeyword('');
                          setSearchResults([]);
                          setSearched(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                          ? 'bg-showcase-primary text-white  '
                          : 'text-gray-600'
                          }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                  {parentCategories.length === 0 && (
                    <p className="text-sm text-gray-400 italic">Đang tải danh mục...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Search Results or Child Category Grid */}
          <div className="flex-1">

            {/* ─── SEARCH MODE ─── */}
            {isInSearchMode && (
              <>
                <div className="flex items-center justify-between mb-8">
                  {keyword && !isSearching && (
                    <span className="text-sm text-gray-500">
                      {searchResults.length > 0
                        ? <><span className="font-bold text-gray-800">{searchResults.length}</span> sản phẩm cho <strong>"{keyword}"</strong></>
                        : <>Không tìm thấy kết quả cho <strong>"{keyword}"</strong></>
                      }
                    </span>
                  )}
                  {isSearching && (
                    <span className="text-sm text-gray-400 animate-pulse">Đang tìm kiếm...</span>
                  )}
                  <button
                    onClick={handleReset}
                    className="text-xs font-bold text-amber-700 hover:underline ml-auto"
                  >
                    ← Quay lại danh mục
                  </button>
                </div>

                {/* Loading */}
                {isSearching && (
                  <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-700 rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm animate-pulse">Đang tìm kiếm...</p>
                  </div>
                )}

                {/* No results */}
                {!isSearching && searched && searchResults.length === 0 && (
                  <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-2xl">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <InboxOutlined className="text-2xl text-gray-400" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h4>
                    <p className="text-gray-500 text-sm mb-6">
                      Không có sản phẩm nào phù hợp với từ khóa <strong>"{keyword}"</strong>.
                    </p>
                    <button
                      onClick={handleReset}
                      className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-showcase-primary transition-colors text-sm uppercase tracking-wider"
                    >
                      Xem tất cả danh mục
                    </button>
                  </div>
                )}

                {/* Search Results Grid */}
                {!isSearching && searchResults.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                    {searchResults.map((item) => (
                      <Link
                        key={item.id || item._id}
                        to={`/san-pham/${item.slug}`}
                        className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-amber-200 transition-all duration-300 flex flex-col"
                      >
                        <div className="aspect-square w-full overflow-hidden bg-gray-50">
                          <img
                            src={item.image || MOCK_PRODUCT_PLACEHOLDER}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                            {item.name}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sản phẩm</span>
                            <ArrowRightOutlined className="text-[10px] text-gray-300 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* View all results link */}
                {!isSearching && searchResults.length > 0 && (
                  <div className="mt-8 text-center">
                    <Link
                      to={`/san-pham/danh-sach?search=${encodeURIComponent(keyword)}`}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors text-sm uppercase tracking-wider"
                    >
                      Xem tất cả kết quả <ArrowRightOutlined />
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* ─── CATEGORY BROWSE MODE ─── */}
            {!isInSearchMode && (
              <>
                <div className="flex items-center justify-between mb-8">
                  {keyword && (
                    <span className="text-sm text-gray-500">
                      {allChildren.length} kết quả cho <strong>"{keyword}"</strong>
                    </span>
                  )}
                </div>

                {allChildren.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {allChildren.map((child: any) => (
                      <div
                        key={child.id || child._id}
                        onClick={() => navigate(`${ROUTES.DANH_SACH_SAN_PHAM}?slug=${child.slug}`)}
                        className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer border border-gray-100 flex flex-col h-full"
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden relative bg-gray-50 flex-shrink-0">
                          <img
                            src={MOCK_PRODUCT_PLACEHOLDER}
                            alt={child.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 mix-blend-multiply"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 group-hover:text-showcase-primary transition-colors">
                              {child.name}
                            </h4>
                            {child.description && (
                              <p className="text-sm text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                                {child.description}
                              </p>
                            )}
                          </div>

                          <div className="mt-6 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-gray-400 group-hover:text-showcase-primary transition-colors pt-4 border-t border-gray-50">
                            <span>XEM DANH SÁCH</span>
                            <ArrowRightOutlined className="group-hover:translate-x-2 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-2xl">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <InboxOutlined className="text-2xl text-gray-400" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      Chưa có danh mục con
                    </h4>
                    <p className="text-gray-500 text-sm">
                      Danh mục này hiện đang trống, bạn có muốn xem tất cả sản phẩm thuộc danh mục này không?
                    </p>
                    <button
                      onClick={() => navigate(`${ROUTES.DANH_SACH_SAN_PHAM}?slug=${activeParent?.slug}`)}
                      className="mt-6 px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-showcase-primary transition-colors text-sm uppercase tracking-wider"
                    >
                      Xem toàn bộ sản phẩm
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CategoryExplorerPage;
