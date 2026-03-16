import React,{useMemo,useState} from 'react';
import Container from '@/src/features/showcase/components/ui/Container';
import Badge from '@/src/features/showcase/components/ui/Badge';
import ProductCard from '@/src/features/showcase/components/ui/ProductCard';
import SEO from '@/src/components/common/SEO';
import { Search,X,Filter } from 'lucide-react';
import { MOCK_SHOWCASE_PROJECTS } from '@/src/mockData';
import { ShowcaseProjectCategory } from '@/src/types';

const ProjectsPage: React.FC = () => {
  const projects = MOCK_SHOWCASE_PROJECTS;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const categories = ['Tất cả', 'Nhà ở', 'Thương mại', 'Công nghiệp'];

  const filteredProjects = useMemo(() => {
    return projects.filter(proj => {
      const matchesSearch = proj.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            proj.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Tất cả' || proj.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="bg-gray-50">
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
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`w-full text-left px-4 py-3 rounded-2xl border text-sm font-semibold transition-all ${
                            selectedCategory === cat
                              ? 'bg-showcase-primary text-white border-showcase-primary shadow-sm'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-showcase-primary/30 hover:bg-gray-50'
                          }`}
                        >
                          {cat}
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
                Hiển thị {filteredProjects.length} công trình {searchQuery && `cho "${searchQuery}"`}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {filteredProjects.map((proj, i) => (
                  <ProductCard
                    key={i}
                    basePath="/cong-trinh"
                    slug={proj.slug}
                    title={proj.title}
                    image={proj.coverImage}
                    category={proj.category}
                    tag={proj.category.toUpperCase()}
                  />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default ProjectsPage;
