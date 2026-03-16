import React from 'react';
import Container from '@/src/features/showcase/components/ui/Container';
import Badge from '@/src/features/showcase/components/ui/Badge';
import { 
  SafetyCertificateOutlined, 
  ThunderboltOutlined, 
  TeamOutlined, 
  CrownOutlined,
  CheckCircleFilled
} from '@ant-design/icons';
import SEO from '@/src/components/common/SEO';

const WhyChooseUsPage: React.FC = () => {
  const values = [
    {
      icon: <CrownOutlined className="text-4xl text-showcase-primary" />,
      title: 'Chất lượng Thượng hạng',
      desc: 'Chúng tôi chỉ sử dụng Gỗ Óc Chó nhập khẩu 100% từ Bắc Mỹ (FAS Grade), đảm bảo vân gỗ sắc nét và độ bền vĩnh cửu.'
    },
    {
      icon: <ThunderboltOutlined className="text-4xl text-showcase-primary" />,
      title: 'Thi công Tốc độ',
      desc: 'Quy trình sản xuất hiện đại giúp rút ngắn 30% thời gian thi công so với thị trường mà vẫn đảm bảo độ tinh xảo tuyệt đối.'
    },
    {
      icon: <TeamOutlined className="text-4xl text-showcase-primary" />,
      title: 'Đội ngũ Chuyên gia',
      desc: 'Hơn 10 năm kinh nghiệm với đội ngũ kiến trúc sư và nghệ nhân mộc tài hoa, am hiểu sâu sắc về phong cách Luxury.'
    },
    {
      icon: <SafetyCertificateOutlined className="text-4xl text-showcase-primary" />,
      title: 'Bảo hành Dài hạn',
      desc: 'Cam kết bảo hành 5 năm và bảo trì trọn đời cho mọi sản phẩm nội thất mang thương hiệu Hochi.'
    }
  ];

  return (
    <div className="bg-white">
      <SEO 
        title="Vì sao chọn chúng tôi" 
        description="Ưu điểm vượt trội của Nội Thất Hochi: Chất liệu gỗ óc chó FAS Bắc Mỹ, thi công thần tốc, đội ngũ nghệ nhân tài hoa và chế độ bảo hành vĩnh cửu."
      />
      
      {/* Hero */}
      <section className="relative h-[450px] flex items-center pt-20">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1600" 
            alt="Why Choose Us Hero" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>
        <Container className="relative z-10 text-center text-white">
          <Badge variant="gold">GIÁ TRỊ CỐT LÕI</Badge>
          <h1 className="text-5xl font-bold uppercase tracking-widest mt-6" style={{ fontFamily: "'Inter', sans-serif" }}>VÌ SAO CHỌN CHÚNG TÔI?</h1>
        </Container>
      </section>

      {/* Core Values Grid */}
      <section className="py-24">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {values.map((v, i) => (
              <div key={i} className="p-10 bg-gray-50 rounded-3xl text-center space-y-6 hover:bg-white hover:shadow-2xl transition-all border border-gray-100 group">
                <div className="mx-auto w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  {v.icon}
                </div>
                <h3 className="text-xl font-bold text-teal-950">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Expertise Section */}
      <section className="py-24 bg-teal-950 text-white overflow-hidden">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1200" className="rounded-3xl shadow-2xl z-10 relative" alt="Workshop" loading="lazy" />
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-showcase-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-showcase-primary/10 rounded-full blur-3xl"></div>
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-showcase-primary font-bold tracking-widest text-sm uppercase">QUY TRÌNH CHUYÊN NGHIỆP</span>
                <h2 className="text-4xl font-bold uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>CHẾ TÁC TỪ TÂM - <br/> NÂNG TẦM ĐIỂM SỐNG</h2>
              </div>
              <div className="space-y-6">
                {[
                  'Gỗ FAS nhập khẩu trực tiếp từ Bắc Mỹ, tẩm sấy tiêu chuẩn 12% độ ẩm.',
                  'Sử dụng sơn Inchem (Mỹ) 7 lớp, bảo vệ bề mặt tối ưu, an toàn sức khỏe.',
                  'Kết cấu mộng truyền thống kết hợp công nghệ CNC chính xác 0.1mm.',
                  'Lắp đặt và bàn giao chìa khóa trao tay với dịch vụ tận tâm 24/7.'
                ].map((text, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <CheckCircleFilled className="text-showcase-primary text-xl mt-1" />
                    <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust Quote */}
      <section className="py-24 text-center">
        <Container>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-6xl text-gray-200 font-serif">"</div>
            <p className="text-2xl md:text-3xl font-light text-gray-600 leading-relaxed italic">
              Chúng tôi không chỉ bán nội thất, chúng tôi kiến tạo không gian sống mơ ước nơi mỗi gia chủ tìm thấy sự bình yên và đẳng cấp thực sự.
            </p>
            <div className="w-16 h-1 bg-showcase-primary mx-auto"></div>
            <p className="font-bold text-teal-950 uppercase tracking-widest">GĐ. Nguyễn Văn Tú</p>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default WhyChooseUsPage;
