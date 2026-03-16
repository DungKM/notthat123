import React from 'react';
import Container from '@/src/features/showcase/components/ui/Container';
import ProductCard from '@/src/features/showcase/components/ui/ProductCard';
import SEO from '@/src/components/common/SEO';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Sản phẩm" 
        description="Khám phá bộ sưu tập nội thất gỗ óc chó cao cấp của Hochi, từ sofa, bàn ăn đến trọn gói nội thất biệt thự."
      />
      <section className="relative h-[400px] flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600"
            alt="Contact Office"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <Container className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>SẢN PHẨM</h1>
        </Container>
      </section>

      {/* Search & Filter Header */}
      <section className="bg-white pt-32 pb-12 border-b border-gray-100 shadow-sm">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <h1 className="text-3xl font-bold text-teal-950 uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>SẢN PHẨM</h1>
            <div className="relative w-full md:w-[400px]">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-6 py-3 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-showcase-primary outline-none transition-all text-sm"
              />
              <button className="absolute right-2 top-1.5 bg-teal-900 text-white px-5 py-1.5 rounded-full text-sm font-medium hover:bg-showcase-primary transition-colors">TÌM</button>
            </div>
          </div>
        </Container>
      </section>

      {/* Product List */}
      <section className="py-20">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {products.map((product, i) => (
              <ProductCard key={i} basePath="/san-pham" {...product} />
            ))}
          </div>

          {/* Pagination Placeholder */}
          <div className="mt-24 flex justify-center gap-2">
            {[1, 2, 3, '...'].map((p, i) => (
              <button key={i} className={`w-10 h-10 flex items-center justify-center rounded-md border font-medium transition-all ${p === 1 ? 'bg-teal-900 text-white border-teal-900' : 'bg-white text-gray-400 border-gray-200 hover:border-showcase-primary hover:text-showcase-primary'}`}>
                {p}
              </button>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
};

export default ProductsPage;
