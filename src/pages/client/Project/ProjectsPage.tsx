import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Container from '@/src/features/showcase/components/ui/Container';
import Badge from '@/src/features/showcase/components/ui/Badge';
import SEO from '@/src/components/common/SEO';
import { Search, X, Filter } from 'lucide-react';
import { useConstructionService, useConstructionCategoryService } from '@/src/api/services';
import { useApi } from '@/src/hooks/useApi';

// ====================== Project Card ======================

interface ProjectCardProps {
  slug: string;
  name: string;
  image: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ slug, name, image }) => (
  <Link to={`/cong-trinh/${slug}`} className="group block">
    <div className="overflow-hidden bg-gray-100">
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

  // Đồng bộ selectedCategoryId khi url thay đổi (từ menu)
  useEffect(() => {
    if (categoryParam !== selectedCategoryId) {
      setSelectedCategoryId(categoryParam);
      setCurrentPage(1);
    }
  }, [categoryParam]);

  useEffect(() => {
    getCategories({ limit: 50 }).then(res => {
      setCategories(res || []);
    }).catch(console.error);
  }, [getCategories]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (searchQuery.trim()) {
          // Dùng /search API khi có keyword (giống header)
          const res = await searchRequest('GET', '', null, { keyword: searchQuery.trim(), limit: 50 });
          let constructions: any[] = res?.data?.constructions || [];
          // Lọc thêm theo category nếu đang chọn
          if (selectedCategoryId) {
            constructions = constructions.filter(
              (c: any) => (c.categoryId === selectedCategoryId || c.category?._id === selectedCategoryId || c.category?.id === selectedCategoryId || c.category?.slug === selectedCategoryId)
            );
          }
          setProjects(constructions);
          setMeta({ page: 1, limit: constructions.length, total: constructions.length, totalPages: 1 });
        } else {
          // Không có keyword: gọi API công trình gốc
          const query: any = { page: currentPage, limit: 12 };
          if (selectedCategoryId) query.categoryId = selectedCategoryId;
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
  }, [selectedCategoryId, searchQuery, currentPage, constructionRequest, searchRequest]);

  const handleCategorySelect = (catValue: string) => {
    setSelectedCategoryId(catValue);
    setCurrentPage(1);
    if (catValue) {
      setSearchParams({ category: catValue });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <SEO
        title="Công trình"
        description="Xem các dự án thiết kế và thi công nội thất thực tế của Hochi tại các biệt thự, penthouse và căn hộ cao cấp."
      />

      {/* Hero Banner */}
      <section className="relative h-[400px] flex items-center pt-20">
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
          <h1 className="text-5xl font-bold uppercase tracking-widest mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>CÔNG TRÌNH THỰC TẾ</h1>
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
                        placeholder="Vinhomes, biệt thự..."
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
                    <div className="space-y-2">
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
                        const catValue = cat.slug || cat._id || cat.id;
                        return (
                          <button
                            key={cat._id || cat.id}
                            type="button"
                            onClick={() => handleCategorySelect(catValue)}
                            className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${selectedCategoryId === catValue
                              ? 'bg-showcase-primary text-white border-showcase-primary shadow-sm'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-showcase-primary/30 hover:bg-gray-50'
                              }`}
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Content */}
            <div>
              <div className="mb-6 text-xs text-gray-400 font-medium uppercase tracking-widest">
                Hiển thị {projects.length} công trình {searchQuery && `cho "${searchQuery}"`}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : projects.length === 0 ? (
                <div className="py-20 text-center text-gray-400">
                  <p className="text-lg">Không tìm thấy công trình nào phù hợp.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                  {projects.map((proj, i) => {
                    const coverImage =
                      proj.images && proj.images.length > 0
                        ? proj.images[0].url
                        : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80';
                    return (
                      <ProjectCard
                        key={proj._id || proj.id || i}
                        slug={proj.slug || String(proj._id || proj.id)}
                        name={proj.name}
                        image={coverImage}
                      />
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {meta.totalPages > 1 && (
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
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default ProjectsPage;
