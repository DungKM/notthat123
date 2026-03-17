import React from 'react';
import Container from '@/src/features/showcase/components/ui/Container';
import ProductCard from '@/src/features/showcase/components/ui/ProductCard';
import SEO from '@/src/components/common/SEO';

import { useSearchParams } from 'react-router-dom';
import { Search, X, Filter } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const products = [
    { slug: 'biet-thu-go-oc-cho-1', title: 'Biệt thự gỗ óc chó 1', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800', tag: 'HOT', category: 'Biệt Thự' },
    { slug: 'biet-thu-go-oc-cho-2', title: 'Biệt thự gỗ óc chó 2', image: 'https://noithat102.vn/uploads/Sofa%2015.jpg', category: 'Căn Hộ' },
    { slug: 'sofa-go-oc-cho', title: 'Sofa gỗ óc chó cao cấp', image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=800', tag: 'NEW', category: 'Phòng Khách' },
    { slug: 'ban-an-go-oc-cho', title: 'Bàn ăn gỗ óc chó 6 ghế', image: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&q=80&w=800', category: 'Phòng Bếp' },
    { slug: 'giuong-ngu-go-oc-cho', title: 'Giường ngủ gỗ óc chó', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800', category: 'Phòng Ngủ' },
    { slug: 'tu-ruou-go-oc-cho', title: 'Tủ rượu gỗ óc chó', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800', category: 'Phòng Khách' },
    { slug: 'ke-tivi-go-oc-cho', title: 'Kệ tivi gỗ óc chó', image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800', category: 'Phòng Khách' },
    { slug: 'noi-that-phong-khach', title: 'Nội thất phòng khách', image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=80&w=800', category: 'Trọn Gói' },
    { slug: 'noi-that-phong-ngu', title: 'Nội thất phòng ngủ', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800', category: 'Trọn Gói' },
    { slug: 'noi-that-phong-bep', title: 'Nội thất phòng bếp', image: 'https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?auto=format&fit=crop&q=80&w=800', category: 'Trọn Gói' },
    { slug: 'sofa-da-bo', title: 'Sofa da bò cao cấp', image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800', category: 'Nội Thất' },
    { slug: 'ban-tra-go-oc-cho', title: 'Bàn trà gỗ óc chó', image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=800', category: 'Phòng Khách' },
  ];

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState(searchParams.get('category') || 'Tất cả');

  // Update selectedCategory when URL changes
  React.useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // Derived categories from products
  const categories = React.useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['Tất cả', ...Array.from(cats).sort()];
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    return products.filter(prod => {
      const matchesSearch = prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Tất cả' || prod.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, products]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'Tất cả') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Sản phẩm"
        description="Khám phá bộ sưu tập nội thất gỗ óc chó cao cấp của Hochi, từ sofa, bàn ăn đến trọn gói nội thất biệt thự."
      />

      {/* Hero Banner */}
      <section className="relative h-[400px] flex items-center pt-20">
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
          <div className="inline-block px-4 py-1.5 border border-white/30 rounded-full text-xs font-bold tracking-widest uppercase mb-6 bg-white/10 backdrop-blur-md">
            BỘ SƯU TẬP
          </div>
          <h1 className="text-5xl font-bold uppercase tracking-widest mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>SẢN PHẨM</h1>
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
                        placeholder="Tìm kiếm sản phẩm..."
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
                          onClick={() => handleCategorySelect(cat)}
                          className={`w-full text-left px-4 py-3 rounded-2xl border text-sm font-semibold transition-all ${selectedCategory === cat
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
                Hiển thị {filteredProducts.length} sản phẩm {searchQuery && `cho "${searchQuery}"`}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-20 text-center text-gray-400">
                  <p className="text-lg">Không tìm thấy sản phẩm nào phù hợp.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product, i) => (
                    <ProductCard key={i} basePath="/san-pham" {...product} />
                  ))}
                </div>
              )}

              {/* Pagination Placeholder */}
              {filteredProducts.length > 0 && (
                <div className="mt-24 flex justify-center gap-2">
                  {[1, 2, 3, '...'].map((p, i) => (
                    <button key={i} className={`w-10 h-10 flex items-center justify-center rounded-md border font-medium transition-all ${p === 1 ? 'bg-teal-900 text-white border-teal-900' : 'bg-white text-gray-400 border-gray-200 hover:border-showcase-primary hover:text-showcase-primary'}`}>
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
