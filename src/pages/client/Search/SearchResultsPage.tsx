import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Container from '@/src/features/showcase/components/ui/Container';
import SEO from '@/src/components/common/SEO';
import { useApi } from '@/src/hooks/useApi';
import { SearchOutlined, ArrowRightOutlined, InboxOutlined } from '@ant-design/icons';

// Chỉ cho phép: chữ cái (bao gồm tiếng Việt), số, khoảng trắng, dấu gạch ngang, dấu phẩy, chấm
const ALLOWED_CHARS_REGEX = /[^\p{L}\p{N}\s\-,.']/gu;

const sanitizeInput = (value: string): string => {
  return value.replace(ALLOWED_CHARS_REGEX, '').replace(/\s{2,}/g, ' ');
};

const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Phân biệt: reload (F5) thì input rỗng, navigate từ trang khác thì hiển thị query
  const getInitialInput = () => {
    try {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry?.type === 'reload') return '';
    } catch { /* ignore */ }
    return searchParams.get('q') || '';
  };

  const [inputValue, setInputValue] = useState(getInitialInput);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<{ products: any[]; constructions: any[] }>({ products: [], constructions: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const { request: searchRequest } = useApi<any>('/search');

  const doSearch = useCallback(async (kw: string) => {
    if (!kw.trim()) {
      setResults({ products: [], constructions: [] });
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(false);
    try {
      const res = await searchRequest('GET', '', null, { keyword: kw.trim(), limit: 50 });
      const data = res?.data || {};
      setResults({
        products: Array.isArray(data.products) ? data.products : [],
        constructions: Array.isArray(data.constructions) ? data.constructions : [],
      });
    } catch {
      setResults({ products: [], constructions: [] });
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, [searchRequest]);

  // Chạy tìm kiếm khi URL query thay đổi (KHÔNG cập nhật inputValue để tránh hiển thị lại khi reload)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    doSearch(q);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setSearchParams({ q: inputValue.trim() });
  };

  const total = results.products.length + results.constructions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={query ? `Kết quả tìm kiếm "${query}"` : 'Tìm kiếm'}
        description="Tìm kiếm sản phẩm và công trình nội thất Hochi"
      />

      {/* Hero / Search Bar */}
      <section className="relative pt-32 pb-14 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <Container className="relative z-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400 mb-3">Tìm kiếm</p>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-8 uppercase tracking-wide">
            {query ? `"${query}"` : 'Tất cả kết quả'}
          </h1>

          {/* Search Input */}
          {/* <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="flex bg-white  rounded-full overflow-hidden shadow-2xl border-4 border-white/10 transition-all focus-within:border-white/30 group">
              <div className="flex items-center flex-1 px-2">
                <SearchOutlined className="text-gray-400 text-xl ml-4 flex-shrink-0 group-focus-within:text-amber-600 transition-colors" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(sanitizeInput(e.target.value))}
                  placeholder="Nhập từ khóa tìm kiếm (ví dụ: Sofa, Bàn ăn, Thi công...)"
                  autoFocus
                  className="w-full px-4 py-4 text-gray-800 text-[16px] outline-none placeholder-gray-400 bg-transparent font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-10 bg-amber-700 hover:bg-amber-800 text-white font-black text-[15px] uppercase tracking-widest transition-colors flex flex-col justify-center border-l-2 border-white/20"
              >
                <span>Tìm</span>
              </button>
            </div>
          </form> */}

          {/* Result count */}
          {searched && !loading && query && (
            <p className="text-sm text-gray-400 mt-5">
              {total > 0
                ? <><span className="text-white font-bold">{total}</span> kết quả cho <span className="text-amber-400 font-bold">"{query}"</span></>
                : <>Không tìm thấy kết quả nào cho <span className="text-amber-400 font-bold">"{query}"</span></>}
            </p>
          )}
        </Container>
      </section>

      <Container className="py-14">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-700 rounded-full animate-spin" />
            <p className="text-gray-500 text-sm animate-pulse">Đang tìm kiếm...</p>
          </div>
        )}

        {/* Empty state - no query */}
        {!loading && !query && (
          <div className="text-center py-24">
            <SearchOutlined className="text-5xl text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Nhập từ khóa để tìm kiếm</h3>
            <p className="text-gray-400 text-sm">Tìm kiếm sản phẩm nội thất, công trình thi công và nhiều hơn nữa.</p>
          </div>
        )}

        {/* Empty state - searched but no results */}
        {!loading && searched && total === 0 && query && (
          <div className="text-center py-24">
            <InboxOutlined className="text-5xl text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-400 text-sm mb-8">Thử từ khóa khác hoặc xem các gợi ý bên dưới.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Sofa', 'Bàn ăn', 'Giường ngủ', 'Tủ quần áo', 'Biệt thự'].map(kw => (
                <button
                  key={kw}
                  onClick={() => setSearchParams({ q: kw })}
                  className="px-5 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-amber-700 hover:text-amber-700 transition-colors"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && total > 0 && (
          <div className="space-y-14">

            {/* Group: Sản phẩm */}
            {results.products.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Sản phẩm</h2>
                  <span className="text-sm font-bold text-amber-700 bg-amber-50 px-3 py-0.5 rounded-full border border-amber-100">
                    {results.products.length}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                  <Link
                    to={`/san-pham/danh-sach?search=${encodeURIComponent(query)}`}
                    className="text-sm font-bold !text-amber-700 hover:!text-amber-800 flex items-center gap-1 whitespace-nowrap"
                  >
                    Xem tất cả <ArrowRightOutlined className="text-[11px]" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {results.products.map((item: any) => (
                    <Link
                      key={item.id || item._id}
                      to={`/san-pham/${item.slug}`}
                      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-amber-200 transition-all duration-300 flex flex-col"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-gray-50">
                        <img
                          src={item.image || '/assets/images/image-logo.png'}
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
              </section>
            )}

            {/* Group: Công trình */}
            {results.constructions.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Công trình</h2>
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full border border-blue-100">
                    {results.constructions.length}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                  <Link
                    to={`/cong-trinh?search=${encodeURIComponent(query)}`}
                    className="text-sm font-bold !text-blue-600 hover:!text-blue-700 flex items-center gap-1 whitespace-nowrap"
                  >
                    Xem tất cả <ArrowRightOutlined className="text-[11px]" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.constructions.map((item: any) => (
                    <Link
                      key={item.id || item._id}
                      to={`/cong-trinh/${item.slug}`}
                      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col"
                    >
                      <div className="aspect-video w-full overflow-hidden bg-gray-50">
                        <img
                          src={item.image || '/assets/images/image-logo.png'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {item.name}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Công trình</span>
                          <ArrowRightOutlined className="text-[10px] text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};

export default SearchResultsPage;
