import React from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';

const Hero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[600px] md:h-screen md:min-h-[700px] flex items-center pt-20 overflow-hidden">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000"
          alt="Luxury Living"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <Container className="relative z-10 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
          <div className="inline-block border-y border-showcase-primary py-2 px-8 mb-6">
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-showcase-primary">{t('hero.badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
            {t('hero.title_line1')} <br /> {t('hero.title_line2')}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
            {t('hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
              {t('hero.btn_explore')}
            </Button>
            <Button variant="primary" size="lg" className="bg-showcase-primary border-none hover:bg-showcase-hover">
              {t('hero.btn_consult')}
            </Button>
          </div>
        </div>
      </Container>

      {/* Tabs as seen in design - Hidden on mobile, shown on md+ */}
      <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 z-20 hidden md:flex bg-white shadow-xl rounded-t-lg overflow-hidden border-t-4 border-showcase-primary">
        <button className="px-8 py-4 text-sm font-bold uppercase tracking-wider text-teal-900 border-r border-gray-100 bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>{t('hero.tab_villa')}</button>
        <button className="px-8 py-4 text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-teal-900 transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>{t('hero.tab_apartment')}</button>
      </div>
    </section>
  );
};

export default Hero;
