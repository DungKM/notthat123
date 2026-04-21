import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Container from '@/src/features/showcase/components/ui/Container';
import Badge from '@/src/features/showcase/components/ui/Badge';
import SEO from '@/src/components/common/SEO';
import { Search, X, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { useArchitectureService, useArchitectureCategoryService } from '@/src/api/services';
import { useApi } from '@/src/hooks/useApi';

// ====================== Architecture Card ======================

interface ArchitectureCardProps {
  slug: string;
  name: string;
  image: string;
}

const ArchitectureCard: React.FC<ArchitectureCardProps> = ({ slug, name, image }) => (
  <Link to={`/thiet-ke-kien-truc/${slug}`} className="group block">
    <div className="overflow-hidden bg-gray-100">
      <img
        src={image}
        alt={name}
        loading="lazy"
        className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
    <p className="mt-3 text-sm text-[#c9922a] font-medium leading-snug group-hover:underline line-clamp-2">
      {name}
    </p>
  </Link>
);

// ====================== Loading Skeleton ======================

const SkeletonCard: React.FC = () => (
  <div className="animate-pulse">
    <div className="w-full aspect-[4/3] bg-gray-200" />
    <div className="mt-3 h-4 bg-gray-200 rounded w-3/4" />
  </div>
);

// ====================== Architecture Page ======================

const ArchitecturePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState('');

  const { request: architectureRequest, loading: architectureLoading } = useArchitectureService();
  const { getAll: getCategories } = useArchitectureCategoryService();
  const { request: searchRequest, loading: searchLoading } = useApi<any>('/search');
  const loading = searchQuery.trim() ? searchLoading : architectureLoading;

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categoryParam);
  const [items, setItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);

  // Đồng bộ category khi url thay đổi (từ menu)
  useEffect(() => {
    if (categoryParam !== selectedCategoryId) {
      setSelectedCategoryId(categoryParam);
      setCurrentPage(1);
    }
  }, [categoryParam]);

  // Tự động cuộn trên mobile khi chọn từ menu
  useEffect(() => {
    if (window.innerWidth < 1024 && categoryParam) {
      const timer = setTimeout(() => {
        if (listRef.current) {
          const yOffset = -80; // Trừ khoảng hở header
          const y = listRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 600); // Đợi thêm chút để API load và đẩy layout xuống
      return () => clearTimeout(timer);
    }
  }, [categoryParam]);

  useEffect(() => {
    getCategories({ limit: 50 }).then(res => {
      setCategories(res || []);
    }).catch(console.error);
  }, [getCategories]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const qCategoryId = selectedCategoryId || '';

        if (searchQuery.trim()) {
          const res = await searchRequest('GET', '', null, { keyword: searchQuery.trim(), limit: 50 });
          let architectures: any[] = res?.data?.architectures || [];
          if (qCategoryId) {
            architectures = architectures.filter(
              (c: any) => (c.categoryId === qCategoryId || c.category?._id === qCategoryId || c.category?.id === qCategoryId)
            );
          }
          setItems(architectures);
          setMeta({ page: 1, limit: architectures.length, total: architectures.length, totalPages: 1 });
        } else {
          const query: any = { page: currentPage, limit: 12 };
          if (qCategoryId) query.categoryId = qCategoryId;
          const res = await architectureRequest('GET', '', null, query);
          setItems(res.data || []);
          if (res.meta) setMeta(res.meta);
        }
      } catch (e) {
        console.error('Failed to fetch architectures', e);
      }
    };
    const timeoutId = setTimeout(fetchItems, 400);
    return () => clearTimeout(timeoutId);
  }, [selectedCategoryId, searchQuery, currentPage, architectureRequest, searchRequest, categories]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId(catId);
    setCurrentPage(1);

    setTimeout(() => {
      if (window.innerWidth < 1024 && listRef.current) {
        const yOffset = -80;
        const element = listRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <SEO
        title="Thiết kế kiến trúc - Hochi Design"
        description="Khám phá các công trình thiết kế kiến trúc nổi bật của Hochi: biệt thự, nhà phố, công trình thương mại... Thiết kế sáng tạo, thi công chuyên nghiệp."
        canonicalPath="/thiet-ke-kien-truc"
        keywords="thiết kế kiến trúc, kiến trúc biệt thự, kiến trúc nhà phố, hochi design, công trình kiến trúc"
        breadcrumbs={[
          { name: 'Trang chủ', url: '/' },
          { name: 'Thiết kế kiến trúc', url: '/thiet-ke-kien-truc' },
        ]}
      />

      {/* Hero Banner */}
      <section className="relative h-[400px] flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=1600"
            alt="Architecture Hero"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <Container className="relative z-10 text-center text-white">
          <Badge variant="gold">KIẾN TRÚC ĐỈNH CAO</Badge>
          <h1 className="text-5xl font-bold uppercase tracking-widest mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>THIẾT KẾ KIẾN TRÚC</h1>
        </Container>
      </section>

      {/* Filter + Grid Layout */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-8 xl:gap-10">
            {/* Left Filter Sidebar */}
            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Tìm kiếm</p>
                    <h2 className="text-sm font-bold text-teal-950 uppercase tracking-widest mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Bộ lọc
                    </h2>
                  </div>
                  <Filter className="w-4 h-4 text-gray-300" />
                </div>

                <div className="mt-4 space-y-4">
                  {/* Search */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2">
                      Từ khóa
                    </p>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="w-3.5 h-3.5 text-gray-400 group-focus-within:text-showcase-primary transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="Biệt thự, nhà phố..."
                        className="w-full pl-8 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-showcase-primary focus:border-showcase-primary transition-all text-xs"
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

                  {/* Categories */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2">
                      Danh mục
                    </p>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => handleCategorySelect('')}
                        className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${!selectedCategoryId
                          ? 'bg-showcase-primary text-white border-showcase-primary shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-showcase-primary/30 hover:bg-gray-50'
                          }`}
                      >
                        Tất cả
                      </button>

                      {categories.map((cat) => {
                        const catId = cat.id || cat._id;
                        const hasChildren = cat.children && cat.children.length > 0;
                        const isExpanded = expandedCategories.has(catId);
                        const isParentActive = selectedCategoryId === catId;
                        const isChildActive = hasChildren && cat.children.some(
                          (child: any) => (child.id || child._id) === selectedCategoryId
                        );

                        return (
                          <div key={catId}>
                            {/* Danh mục cha */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleCategorySelect(catId)}
                                className={`flex-1 text-left px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${isParentActive || isChildActive
                                  ? 'bg-showcase-primary text-white border-showcase-primary shadow-sm'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-showcase-primary/30 hover:bg-gray-50'
                                  }`}
                              >
                                {cat.name}
                              </button>
                              {hasChildren && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedCategories(prev => {
                                      const next = new Set(prev);
                                      if (next.has(catId)) next.delete(catId);
                                      else next.add(catId);
                                      return next;
                                    });
                                  }}
                                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all"
                                >
                                  {isExpanded
                                    ? <ChevronDown className="w-3 h-3" />
                                    : <ChevronRight className="w-3 h-3" />
                                  }
                                </button>
                              )}
                            </div>

                            {/* Danh mục con */}
                            {hasChildren && isExpanded && (
                              <div className="mt-1 ml-3 space-y-1 border-l-2 border-gray-100 pl-2">
                                {cat.children.map((child: any) => {
                                  const childId = child.id || child._id;
                                  return (
                                    <button
                                      key={childId}
                                      type="button"
                                      onClick={() => handleCategorySelect(childId)}
                                      className={`w-full text-left px-3 py-1.5 rounded-lg border text-xs transition-all ${selectedCategoryId === childId
                                        ? 'bg-showcase-primary text-white border-showcase-primary shadow-sm font-semibold'
                                        : 'bg-white text-gray-600 border-gray-100 hover:border-showcase-primary/30 hover:bg-gray-50 font-medium'
                                        }`}
                                    >
                                      {child.name}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Content */}
            <div ref={listRef}>
              {(() => {
                const currentCategory = categories.find((cat: any) =>
                  cat._id === selectedCategoryId || cat.id === selectedCategoryId
                );
                const isParentCategory = currentCategory && currentCategory.children && currentCategory.children.length > 0;

                return (
                  <>
                    <div className="mb-6 text-xs text-gray-400 font-medium uppercase tracking-widest">
                      {isParentCategory
                        ? `Danh mục con thuộc ${currentCategory.name}`
                        : `Hiển thị ${items.length} thiết kế ${searchQuery ? `cho "${searchQuery}"` : ''}`
                      }
                    </div>

                    {loading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                      </div>
                    ) : isParentCategory ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                        {currentCategory.children.map((child: any) => {
                          const childValue = child.id || child._id;
                          const coverImage = child.representativeImage || child.image || child.thumbnail || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80';
                          return (
                            <button
                              key={childValue}
                              onClick={() => {
                                handleCategorySelect(childValue);
                                setExpandedCategories(prev => new Set(prev).add(currentCategory._id || currentCategory.id));
                              }}
                              className="group block text-left"
                            >
                              <div className="overflow-hidden bg-gray-100 rounded-xl">
                                <img
                                  src={coverImage}
                                  alt={child.name}
                                  loading="lazy"
                                  className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>
                              <h3 className="mt-3 text-sm font-bold text-gray-800 uppercase tracking-wide group-hover:text-showcase-primary transition-colors">
                                {child.name}
                              </h3>
                            </button>
                          );
                        })}
                      </div>
                    ) : items.length === 0 ? (
                      <div className="py-20 text-center text-gray-400">
                        <p className="text-lg">Không tìm thấy thiết kế nào phù hợp.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                        {items.map((item, i) => {
                          const coverImage =
                            item.images && item.images.length > 0
                              ? item.images[0].url
                              : item.image;
                          return (
                            <ArchitectureCard
                              key={item._id || item.id || i}
                              slug={`${item.slug || String(item._id || item.id)}?id=${item._id || item.id}`}
                              name={item.name}
                              image={coverImage}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Pagination */}
                    {!(currentCategory && currentCategory.children && currentCategory.children.length > 0) && meta.totalPages > 1 && (
                      <div className="mt-24 flex flex-wrap justify-center items-center gap-2">
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
                                  : 'bg-white text-gray-400 border-gray-200 hover:border-showcase-primary hover:text-showcase-primary'
                                }`}
                            >
                              {p}
                            </button>
                          ));
                        })()}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default ArchitecturePage;
