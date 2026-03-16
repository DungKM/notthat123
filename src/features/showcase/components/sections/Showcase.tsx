import React from 'react';
import Container from '../ui/Container';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const Showcase: React.FC = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <Container>
        {/* Section Title */}
        <div className="text-center mb-16 space-y-4">
          <Badge variant="gold">VỀ CHÚNG TÔI</Badge>
          <h2 className="text-4xl font-bold text-teal-950" style={{ fontFamily: "'Inter', sans-serif" }}>NỘI THẤT CAO CẤP 102</h2>
          <div className="w-24 h-1 bg-showcase-primary mx-auto"></div>
          <p className="max-w-3xl mx-auto text-gray-500 leading-relaxed font-light">
            Sơ hữu đội ngũ nhà thi công thiết kế tài năng và giàu kinh nghiệm, chúng tôi tự hào mang đến cho quý khách hàng những sản phẩm nội thất tinh xảo, chất lượng đạt tiêu chuẩn quốc tế.
          </p>
        </div>

        {/* Feature 1: Image Left, Text Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-20 lg:mb-32">
          <div className="relative">
            <div className="absolute -inset-4 bg-gray-50 -z-10 rounded-2xl transform rotate-3"></div>
            <img 
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200" 
              alt="Perfection" 
              className="rounded-xl shadow-2xl w-full aspect-[4/3] object-cover"
              loading="lazy"
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-gray-900 uppercase tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>SỰ HOÀN HẢO</h3>
            <p className="text-gray-600 leading-relaxed">
              Từ vật liệu thô mộc đến từng đường nét chạm khắc, mọi chi tiết đều được chúng tôi chăm chút kĩ lưỡng. Sản phẩm hoàn thiện không chỉ mang giá trị thẩm mỹ cao mà còn là cam kết về chất lượng và độ bền vượt thời gian.
            </p>
            <Button variant="outline" className="text-xs tracking-[0.2em]">XEM THÊM ›</Button>
          </div>
        </div>

        {/* Feature 2: Text Left, Image Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 space-y-6">
            <h3 className="text-3xl font-bold text-gray-900 uppercase tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>SHOWROOM <br /> NỘI THẤT 102</h3>
            <p className="text-gray-600 leading-relaxed">
              Hệ thống Showroom hiện đại tại các thành phố lớn giúp khách hàng có cái nhìn trực quan và chân thực nhất về không gian sống mơ ước. Hãy đến để cảm nhận sự khác biệt trong phong cách thiết kế của chúng tôi.
            </p>
            <Button variant="outline" className="text-xs tracking-[0.2em]">THAM QUAN ›</Button>
          </div>
          <div className="order-1 lg:order-2 relative">
            <div className="absolute -inset-4 bg-teal-50 -z-10 rounded-2xl transform -rotate-3"></div>
            <img 
              src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1200" 
              alt="Showroom" 
              className="rounded-xl shadow-2xl w-full aspect-[4/3] object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Showcase;
