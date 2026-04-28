import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import Container from '@/src/features/showcase/components/ui/Container';
import Badge from '@/src/features/showcase/components/ui/Badge';
import SEO from '@/src/components/common/SEO';
import PaginationControls from '@/src/components/common/PaginationControls';
import { Search, X, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { useConstructionService, useConstructionCategoryService } from '@/src/api/services';
import { useApi } from '@/src/hooks/useApi';

const SIBLING_ITEMS_PER_PAGE_MOBILE = 2;
const SIBLING_ITEMS_PER_PAGE_DESKTOP = 3;
const SIBLING_AUTO_SLIDE_INTERVAL_MS = 4000;

// ====================== Project Card ======================

interface ProjectCardProps {
  slug: string;
  name: string;
  image: string;
  id: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ slug, name, image, id }) => (
  <Link to={`/thiet-ke-noi-that/${slug}?id=${id}`} className="group block">
    <div className="overflow-hidden bg-gray-100 rounded-xl">
      <img
        src={image}
        alt={name}
        loading="lazy"
        className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
    {/* Tên công trình - không có dấu chấm */}
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

// ====================== Projects Page ======================

const ProjectsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const categoryParam = searchParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState('');

  const { request: constructionRequest, loading: constructionLoading } = useConstructionService();
  const { getAll: getCategories } = useConstructionCategoryService();
  const { request: searchRequest, loading: searchLoading } = useApi<any>('/search');
  const loading = searchQuery.trim() ? searchLoading : constructionLoading;

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categoryParam);
  const [projects, setProjects] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isMobileView, setIsMobileView] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [siblingPage, setSiblingPage] = useState(0);
  const [siblingAutoSlideDisabled, setSiblingAutoSlideDisabled] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const contentStartRef = useRef<HTMLDivElement>(null);
  const siblingScrollRef = useRef<HTMLDivElement>(null);

  const scrollToTargetSection = () => {
    const yOffset = -80;
    const target = listRef.current || contentStartRef.current;
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === currentPage) return;
    setCurrentPage(nextPage);
    scrollToTargetSection();
  };

  const buildExpandedSetForSelection = (catId: string) => {
    if (!catId) return new Set<string>();

    let matchedParentId = '';

    for (const cat of categories) {
      const parentId = cat.id || cat._id;
      const isParentSelected =
        parentId === catId ||
        cat.slug === catId;

      if (isParentSelected && cat.children?.length > 0) {
        matchedParentId = parentId;
        break;
      }

      const childMatched = cat.children?.some(
        (child: any) => (child.id || child._id) === catId || child.slug === catId
      );

      if (childMatched) {
        matchedParentId = parentId;
        break;
      }
    }

    return matchedParentId ? new Set<string>([matchedParentId]) : new Set<string>();
  };

  // Scroll đến phần list khi navigate từ mobile menu với hash #danh-sach
  useEffect(() => {
    if (location.hash === '#danh-sach') {
      const timer = setTimeout(() => {
        scrollToTargetSection();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  // Đồng bộ category khi url thay đổi (từ menu)
  useEffect(() => {
    if (categoryParam !== selectedCategoryId) {
      setSelectedCategoryId(categoryParam);
      setCurrentPage(1);
    }
  }, [categoryParam]);

  // Tự động cuộn trên mobile khi chọn từ menu
  useEffect(() => {
    if (location.hash === '#danh-sach' && categoryParam) {
      const timer = setTimeout(() => {
        scrollToTargetSection();
      }, 600); // Đợi thêm chút để API load và đẩy layout xuống
      return () => clearTimeout(timer);
    }
  }, [categoryParam, location.hash]);

  useEffect(() => {
    const onResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    getCategories({ limit: 50 }).then(res => {
      setCategories(res || []);
    }).catch(console.error);
  }, [getCategories]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Dùng trực tiếp ID - không cần resolve slug nữa, tránh trùng tên
        const qCategoryId = selectedCategoryId || '';

        if (searchQuery.trim()) {
          // Dùng /search API khi có keyword (giống header)
          const res = await searchRequest('GET', '', null, { keyword: searchQuery.trim(), limit: 50 });
          let constructions: any[] = res?.data?.constructions || [];
          // Lọc thêm theo category nếu đang chọn
          if (qCategoryId) {
            constructions = constructions.filter(
              (c: any) => (c.categoryId === qCategoryId || c.category?._id === qCategoryId || c.category?.id === qCategoryId || c.category?.slug === qCategoryId)
            );
          }
          setProjects(constructions);
          setMeta({ page: 1, limit: constructions.length, total: constructions.length, totalPages: 1 });
        } else {
          // Không có keyword: gọi API công trình gốc
          const query: any = { page: currentPage, limit: 12 };
          if (qCategoryId) query.categoryId = qCategoryId;
          const res = await constructionRequest('GET', '', null, query);
          setProjects(res.data || []);
          if (res.meta) setMeta(res.meta);
        }
      } catch (e) {
        console.error('Failed to fetch projects', e);
      }
    };
    const timeoutId = setTimeout(fetchProjects, 400);
    return () => clearTimeout(timeoutId);
  }, [selectedCategoryId, searchQuery, currentPage, constructionRequest, searchRequest, categories]);

  useEffect(() => {
    const next = buildExpandedSetForSelection(selectedCategoryId);
    setExpandedCategories(prev => {
      if (prev.size === next.size && [...prev].every((id) => next.has(id))) {
        return prev;
      }
      return next;
    });
  }, [selectedCategoryId, categories]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId(catId);
    setCurrentPage(1);
    const next = buildExpandedSetForSelection(catId);
    setExpandedCategories(prev => {
      if (prev.size === next.size && [...prev].every((id) => next.has(id))) {
        return prev;
      }
      return next;
    });

    setTimeout(() => {
      if (window.innerWidth < 1024 && contentStartRef.current) {
        scrollToTargetSection();
      }
    }, 100);
  };

  const currentCategory = categories.find((cat: any) =>
    cat._id === selectedCategoryId || cat.id === selectedCategoryId || cat.slug === selectedCategoryId
  );
  const isParentCategory = currentCategory && currentCategory.children && currentCategory.children.length > 0;
  const siblingCategoryParent = (() => {
    if (!categories.length) return null;

    if (currentCategory?.children?.length > 0) {
      return currentCategory;
    }

    const matchedParent = categories.find((cat: any) =>
      cat.children?.some((c: any) => c.id === selectedCategoryId || c._id === selectedCategoryId || c.slug === selectedCategoryId)
    );
    if (matchedParent) return matchedParent;

    return isMobileView
      ? categories.find((cat: any) => cat.children && cat.children.length > 0) || null
      : null;
  })();

  const siblingChildren = siblingCategoryParent?.children || [];
  const siblingItemsPerPage = isMobileView
    ? SIBLING_ITEMS_PER_PAGE_MOBILE
    : SIBLING_ITEMS_PER_PAGE_DESKTOP;

  const siblingChunks = useMemo(() => {
    const chunks: any[][] = [];
    for (let i = 0; i < siblingChildren.length; i += siblingItemsPerPage) {
      chunks.push(siblingChildren.slice(i, i + siblingItemsPerPage));
    }
    return chunks;
  }, [siblingChildren, siblingItemsPerPage]);
  const siblingTotalPages = siblingChunks.length;

  const handleSiblingScroll = () => {
    if (!siblingScrollRef.current) return;
    const width = siblingScrollRef.current.clientWidth;
    if (width <= 0) return;
    const newPage = Math.round(siblingScrollRef.current.scrollLeft / width);
    if (newPage !== siblingPage) {
      setSiblingPage(newPage);
    }
  };

  const handleSiblingDotClick = (pageIndex: number) => {
    setSiblingAutoSlideDisabled(true);
    const targetPage = Math.max(0, Math.min(pageIndex, siblingTotalPages - 1));
    setSiblingPage(targetPage);

    if (siblingScrollRef.current) {
      siblingScrollRef.current.scrollTo({
        left: targetPage * siblingScrollRef.current.clientWidth,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    setSiblingPage(0);
    setSiblingAutoSlideDisabled(false);

    if (siblingScrollRef.current) {
      siblingScrollRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [siblingCategoryParent?._id, siblingCategoryParent?.id, siblingChildren.length, siblingItemsPerPage]);

  useEffect(() => {
    if (siblingTotalPages <= 1 || siblingAutoSlideDisabled) return;

    const timer = window.setTimeout(() => {
      const nextPage = (siblingPage + 1) % siblingTotalPages;
      setSiblingPage(nextPage);

      if (siblingScrollRef.current) {
        siblingScrollRef.current.scrollTo({
          left: nextPage * siblingScrollRef.current.clientWidth,
          behavior: 'smooth',
        });
      }
    }, SIBLING_AUTO_SLIDE_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [siblingPage, siblingTotalPages, siblingAutoSlideDisabled]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <SEO
        title="Thiết kế nội thất thực tế - Thiết kế & Thi công Nội thất"
        description="Khám phá các công trình thiết kế và thi công nội thất thực tế của Nội Thất Hochi: biệt thự, penthouse, căn hộ, phòng ngủ, phòng khách... Ảnh thực tế 100%."
        canonicalPath="/thiet-ke-noi-that"
        keywords="công trình nội thất, dự án nội thất hochi, thiết kế nội thất biệt thự, thi công nội thất căn hộ, phòng ngủ, phòng khách, tủ bếp"
        breadcrumbs={[
          { name: 'Trang chủ', url: '/' },
          { name: 'Thiết kế nội thất', url: '/thiet-ke-noi-that' },
        ]}
      />

      {/* Hero Banner */}
      <section className="relative h-60 md:h-75 flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600"
            alt="Projects Hero"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <Container className="relative z-10 text-center text-white">
          <Badge variant="gold">KIẾN TẠO KHÔNG GIAN</Badge>
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-widest mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>THIẾT KẾ NỘI THẤT</h1>
        </Container>
      </section>

      <div ref={contentStartRef}>
        {/* Sibling category bar (show on mobile for quick swipe, keep desktop behavior) */}
        {(isMobileView || !isParentCategory) && siblingCategoryParent?.children?.length > 0 && (
          <section className="pt-10 pb-0 relative z-10">
            <Container>
              <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100">
                <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-5">
                  Danh mục {siblingCategoryParent.name}
                </p>
                <div className="relative">
                  <div
                    ref={siblingScrollRef}
                    onScroll={handleSiblingScroll}
                    onPointerDown={() => setSiblingAutoSlideDisabled(true)}
                    className="flex overflow-x-auto hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory -mx-1 px-1 pb-2"
                  >
                    {siblingChunks.map((chunk, chunkIndex) => (
                      <div key={chunkIndex} className="w-full shrink-0 snap-start px-1">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {chunk.map((sib: any) => {
                            const sibId = sib.id || sib._id;
                            const isActive = sibId === selectedCategoryId || sib.slug === selectedCategoryId;
                            const itemImage = sib.image || sib.representativeImage;

                            return (
                              <button
                                key={sibId}
                                onClick={() => {
                                  setSiblingAutoSlideDisabled(true);
                                  handleCategorySelect(sibId);
                                }}
                                className={`bg-[#f8fafc] rounded-xl p-3 flex flex-row items-center gap-3 text-left cursor-pointer border transition-all ${isActive
                                  ? 'bg-white border-showcase-primary ring-1 ring-showcase-primary shadow-sm'
                                  : 'border-transparent hover:border-gray-200 hover:shadow-md hover:bg-white'
                                  }`}
                              >
                                {itemImage && (
                                  <div className="w-12 h-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 mix-blend-multiply border border-black/5">
                                    <img src={itemImage} alt={sib.name} className="w-full h-full object-cover" loading="lazy" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className={`text-[12px] md:text-[13px] font-semibold leading-tight line-clamp-2 ${isActive ? 'text-showcase-primary' : 'text-gray-800'}`}>
                                    {sib.name}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {siblingTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-5">
                      {Array.from({ length: siblingTotalPages }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSiblingDotClick(i)}
                          className={`rounded-full transition-all duration-200 ${i === siblingPage
                            ? 'w-6 h-3 bg-showcase-primary'
                            : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                            }`}
                          aria-label={`Trang ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Container>
          </section>
        )}

        {/* Filter + Grid Layout */}
        <section className="pt-10 pb-16 lg:pt-16 lg:pb-24">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-8 xl:gap-10">
              {/* Left Filter Sidebar */}
              <aside className="lg:sticky lg:top-24 h-fit">
                <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm p-4">

                  <div className="mt-4 space-y-4">
                    {/* Search */}


                    {/* Categories */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2">
                        Danh mục
                      </p>
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => handleCategorySelect('')}
                          className={`uppercase w-full text-left px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${!selectedCategoryId
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
                          const isParentActive = selectedCategoryId === catId || cat.slug === selectedCategoryId;
                          const isChildActive = hasChildren && cat.children.some(
                            (child: any) => (child.id || child._id) === selectedCategoryId || child.slug === selectedCategoryId
                          );

                          return (
                            <div key={catId}>
                              {/* Danh mục cha */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleCategorySelect(catId);
                                  }}
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
              <div ref={listRef} id="danh-sach">
                <div className="mb-6 text-xs text-gray-400 font-medium uppercase tracking-widest">
                  {isParentCategory
                    ? `Danh mục con thuộc ${currentCategory.name}`
                    : `Hiển thị ${projects.length} thiết kế nội thất ${searchQuery ? `cho "${searchQuery}"` : ''}`
                  }
                </div>

                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : isParentCategory ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-10">
                    {currentCategory.children.map((child: any) => {
                      const childValue = child.id || child._id;
                      const coverImage = child.representativeImage || child.image || child.thumbnail || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80';
                      return (
                        <button
                          key={childValue}
                          onClick={() => {
                            handleCategorySelect(childValue);
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
                ) : projects.length === 0 ? (
                  <div className="py-20 text-center text-gray-400">
                    <p className="text-lg">Không tìm thấy thiết kế nội thất nào phù hợp.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-10">
                    {projects.map((proj, i) => {
                      const coverImage =
                        proj.images && proj.images.length > 0
                          ? proj.images[0].url
                          : proj.image;
                      return (
                        <ProjectCard
                          key={proj.id || proj._id || i}
                          slug={proj.slug || String(proj.id || proj._id)}
                          name={proj.name}
                          image={coverImage}
                          id={proj.id || proj._id}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {!(currentCategory && currentCategory.children && currentCategory.children.length > 0) && meta.totalPages > 1 && (
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={meta.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
};

export default ProjectsPage;
