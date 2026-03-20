import React, { useEffect, useState } from 'react';
import Container from '@/src/features/showcase/components/ui/Container';
import Badge from '@/src/features/showcase/components/ui/Badge';
import ProductCard from '@/src/features/showcase/components/ui/ProductCard';
import SEO from '@/src/components/common/SEO';
import { Search, X, Filter } from 'lucide-react';
import { useConstructionService, useConstructionCategoryService } from '@/src/api/services';

const ProjectsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // -- Services --
  const { request: constructionRequest, loading } = useConstructionService();
  const { getAll: getCategories } = useConstructionCategoryService();

  // -- State --
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  // -- Load Categories --
  useEffect(() => {
    getCategories({ limit: 50 }).then(res => {
      setCategories(res || []);
    }).catch(console.error);
  }, [getCategories]);

  // -- Load Projects --
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const query: any = { page: currentPage, limit: 12 };

        if (selectedCategoryId) {
          query.categoryId = selectedCategoryId;
        }

        if (searchQuery) {
          query.search = searchQuery; // API support search by name
        }

        const res = await constructionRequest('GET', '', null, query);
        setProjects(res.data || []);
        if (res.meta) {
          setMeta(res.meta);
        }
      } catch (e) {
        console.error('Failed to fetch projects', e);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchProjects();
    }, 400); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [selectedCategoryId, searchQuery, currentPage, constructionRequest]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId(catId);
    setCurrentPage(1);
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
          <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-10 xl:gap-14">
            {/* Left Filter Sidebar */}
            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-3xl shadow-sm p-6 lg:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Tìm kiếm</p>
                    <h2 className="text-lg font-bold text-teal-950 uppercase tracking-widest mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Bộ lọc
                    </h2>
                  </div>
                  <Filter className="w-5 h-5 text-gray-300" />
                </div>

                <div className="mt-6 space-y-6">
                  {/* Search */}
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-400 mb-3">
                      Từ khóa
                    </p>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400 group-focus-within:text-showcase-primary transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="Vinhomes, biệt thự..."
                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-showcase-primary focus:border-showcase-primary transition-all text-sm"
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
                    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-400 mb-3">
                      Danh mục
                    </p>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleCategorySelect('')}
                        className={`w-full text-left px-4 py-3 rounded-2xl border text-sm font-semibold transition-all ${!selectedCategoryId
                          ? 'bg-showcase-primary text-white border-showcase-primary shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-showcase-primary/30 hover:bg-gray-50'
                          }`}
                      >
                        Tất cả
                      </button>

                      {categories.map((cat) => (
                        <button
                          key={cat._id || cat.id}
                          type="button"
                          onClick={() => handleCategorySelect(cat._id || cat.id)}
                          className={`w-full text-left px-4 py-3 rounded-2xl border text-sm font-semibold transition-all ${selectedCategoryId === (cat._id || cat.id)
                              ? 'bg-showcase-primary text-white border-showcase-primary shadow-sm'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-showcase-primary/30 hover:bg-gray-50'
                            }`}
                        >
                          {cat.name}
                        </button>
                      ))}
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
                <div className="py-20 text-center text-gray-400">
                  <p className="text-lg animate-pulse">Đang tải công trình...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="py-20 text-center text-gray-400">
                  <p className="text-lg">Không tìm thấy công trình nào phù hợp.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.map((proj, i) => {
                    const categoryName = proj.categoryId?.name || categories.find(c => (c._id || c.id) === proj.categoryId)?.name || 'Công trình';
                    const coverImage = proj.images && proj.images.length > 0 ? proj.images[0].url : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80';
                    return (
                      <ProductCard
                        key={proj._id || proj.id || i}
                        basePath="/cong-trinh"
                        slug={proj.slug || String(proj._id || proj.id)}
                        title={proj.name}
                        image={coverImage}
                        category={categoryName}
                        tag={categoryName.toUpperCase()}
                      />
                    );
                  })}
                </div>
              )}

              {/* Pagination Placeholder */}
              {meta.totalPages > 1 && (
                <div className="mt-24 flex justify-center gap-2">
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                    <button 
                      key={p} 
                      onClick={() => setCurrentPage(p)}
                      className={`w-10 h-10 flex items-center justify-center rounded-md border font-medium transition-all ${p === currentPage ? 'bg-teal-900 text-white border-teal-900' : 'bg-white text-gray-400 border-gray-200 hover:border-showcase-primary hover:text-showcase-primary'}`}
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

export default ProjectsPage;
