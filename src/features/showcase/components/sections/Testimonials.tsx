import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import Card from '../ui/Card';
import { useTranslation } from 'react-i18next';
import { useConstructionService } from '@/src/api/services';

const Testimonials: React.FC = () => {
  const { t } = useTranslation();
  const { request: constructionRequest } = useConstructionService();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    constructionRequest('GET', '', null, { limit: 3 })
      .then((res) => setProjects(res.data || []))
      .catch(() => {});
  }, []);

  const brands = [
    { name: 'CaffeeF', logo: 'https://noithat102.vn/uploads/image/logo-1.png' },
    { name: 'Dan Tri', logo: 'https://noithat102.vn/uploads/image/logo-4.png' },
    { name: 'CaffeeF', logo: 'https://noithat102.vn/uploads/image/logo-1.png' },
    { name: 'Dan Tri', logo: 'https://noithat102.vn/uploads/image/logo-4.png' },
    { name: 'CaffeeF', logo: 'https://noithat102.vn/uploads/image/logo-1.png' },
    { name: 'Dan Tri', logo: 'https://noithat102.vn/uploads/image/logo-4.png' },
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
            {projects.map((proj) => {
              const coverImage =
                proj.images && proj.images.length > 0
                  ? proj.images[0].url
                  : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800';
              return (
                <Card
                  key={proj._id || proj.id}
                  title={proj.name}
                  subtitle="Dự án thực tế"
                  image={coverImage}
                >
                  <Link
                    to={`/cong-trinh/${proj.slug || proj._id || proj.id}`}
                    className="!text-showcase-primary font-bold text-xs uppercase tracking-widest hover:underline"
                  >
                    {t('common.project_detail')} ›
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Testimonials;

