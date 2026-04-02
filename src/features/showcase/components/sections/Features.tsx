import React from 'react';
import Container from '../ui/Container';
import { PlayCircleFilled } from '@ant-design/icons';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';

const Features: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-gray-50 py-24">
      <Container>
        {/* Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
          <div className="space-y-4">
            <span className="text-showcase-primary font-bold tracking-[0.3em] text-xs uppercase">{t('features.badge')}</span>
            <h2 className="text-4xl font-bold text-teal-950" style={{ fontFamily: "'Inter', sans-serif" }}>{t('features.title')}</h2>
          </div>
          <Button variant="ghost" className="text-teal-900 font-bold border-b-2 border-teal-900 rounded-none px-0">{t('common.view_all_videos')}</Button>
        </div>

        {/* Video Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Large Video Main */}
          <div className="lg:col-span-2 relative group cursor-pointer overflow-hidden rounded-2xl shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200" 
              alt="Biệt Thự Gamuda" 
              className="w-full h-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all flex flex-col items-center justify-center">
              <PlayCircleFilled className="text-7xl text-white/90 drop-shadow-2xl transform transition-transform group-hover:scale-110" />
              <div className="mt-6 text-center">
                <h4 className="text-white font-sans text-2xl font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>Biệt Thự Gamuda Gardens</h4>
                <p className="text-white/80 text-sm mt-2">Thi công hoàn thiện nội thất Gỗ Óc Chó</p>
              </div>
            </div>
          </div>

          {/* Experience Sidebar (as seen in image) */}
          <div className="space-y-8 flex flex-col">
            <div className="bg-teal-950 p-8 rounded-2xl flex-grow text-white flex flex-col justify-center space-y-4">
              <span className="text-showcase-primary text-5xl font-bold italic" style={{ fontFamily: "'Inter', sans-serif" }}>20+</span>
              <h4 className="text-xl font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>{t('features.years')}</h4>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                {t('features.years_desc')}
              </p>
              <div className="pt-4">
                <span className="block text-gray-500 uppercase text-[10px] tracking-widest mb-1">{t('features.hotline_label')}</span>
                <span className="text-xl font-bold text-showcase-primary">0326 908 884</span>
              </div>
            </div>
            
            {/* Secondary Small Video */}
            <div className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg flex-grow">
               <img 
                src="https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800" 
                alt="Thi Cong Noi That" 
                className="w-full h-full min-h-[200px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <PlayCircleFilled className="text-4xl text-white/90" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Features;
