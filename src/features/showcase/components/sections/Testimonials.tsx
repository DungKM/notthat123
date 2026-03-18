import React from 'react';
import Container from '../ui/Container';
import Card from '../ui/Card';
import { useTranslation } from 'react-i18next';

const Testimonials: React.FC = () => {
  const { t } = useTranslation();

  const brands = [
    { name: 'CaffeeF', logo: 'https://noithat102.vn/uploads/image/logo-1.png' },
    { name: 'Dan Tri', logo: 'https://noithat102.vn/uploads/image/logo-4.png' },
    { name: 'CaffeeF', logo: 'https://noithat102.vn/uploads/image/logo-1.png' },
    { name: 'Dan Tri', logo: 'https://noithat102.vn/uploads/image/logo-4.png' },
    { name: 'CaffeeF', logo: 'https://noithat102.vn/uploads/image/logo-1.png' },
    { name: 'Dan Tri', logo: 'https://noithat102.vn/uploads/image/logo-4.png' },
  ];

  const news = [
    { 
      title: 'Biệt thự thông tầng - Nghệ An', 
      subtitle: 'Dự án thực tế', 
      image: 'https://noithat102.vn/uploads/bietthu/btttnnghean/Biet+thu+thong+tang+nghe+an +bia.jpg' 
    },
    { 
      title: 'Biệt thụ Hoàng Gia - TP.Vinh', 
      subtitle: 'Dự án thực tế', 
      image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=800' 
    },
    { 
      title: 'Nội thất sang trọng Penthouse', 
      subtitle: 'Dự án thực tế', 
      image: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&q=80&w=800' 
    },
  ];

  return (
    <section className="py-24 bg-white">
      <Container>
        {/* Media Mentions / Partners */}
        <div className="text-center mb-16">
          <h4 className="text-xl font-bold text-gray-400 uppercase tracking-[0.3em] mb-8">{t('testimonials.media_title')}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all">
            {brands.map((brand, i) => (
              <img key={i} src={brand.logo} alt={brand.name} className="mx-auto object-contain" />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all">
            {brands.map((brand, i) => (
              <img key={i} src={brand.logo} alt={brand.name} className="mx-auto object-contain" />
            ))}
          </div>
        </div>

        {/* Featured News / Projects */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-teal-950 uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>{t('testimonials.news_title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.map((item, i) => (
              <Card 
                key={i} 
                title={item.title} 
                subtitle={item.subtitle} 
                image={item.image}
              >
                <button className="text-showcase-primary font-bold text-xs uppercase tracking-widest hover:underline">{t('common.project_detail')}</button>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Testimonials;
