import React from 'react';
import Container from '../ui/Container';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';

const Showcase: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-white overflow-hidden">
      <Container>
        {/* Section Title */}
        <div className="text-center mb-16 space-y-4">
          <Badge variant="gold">{t('showcase.badge')}</Badge>
          <h2 className="text-4xl font-bold text-teal-950" style={{ fontFamily: "'Inter', sans-serif" }}>{t('showcase.title')}</h2>
          <div className="w-24 h-1 bg-showcase-primary mx-auto"></div>
          <p className="max-w-3xl mx-auto text-gray-500 leading-relaxed font-light">
            {t('showcase.description')}
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
            <h3 className="text-3xl font-bold text-gray-900 uppercase tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>{t('showcase.perfection_title')}</h3>
            <p className="text-gray-600 leading-relaxed">
              {t('showcase.perfection_desc')}
            </p>
            <Button variant="outline" className="text-xs tracking-[0.2em]">{t('common.see_more')}</Button>
          </div>
        </div>

        {/* Feature 2: Text Left, Image Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 space-y-6">
            <h3 className="text-3xl font-bold text-gray-900 uppercase tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>{t('showcase.showroom_title')}</h3>
            <p className="text-gray-600 leading-relaxed">
              {t('showcase.showroom_desc')}
            </p>
            <Button variant="outline" className="text-xs tracking-[0.2em]">{t('common.visit')}</Button>
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
