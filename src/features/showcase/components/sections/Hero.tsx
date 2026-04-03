import React from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/src/routes/index';
import heroBg from '../../../../statics/banner_noithat.jpg'
const Hero: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[600px] md:h-screen md:min-h-[700px] flex items-center pt-20 pb-16 md:pb-0 overflow-hidden">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Luxury Living"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <Container className="relative z-10 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
          <div
            className="inline-block border-y border-showcase-primary py-2 px-8 mb-6"
            style={{
              opacity: 0,
              animation: 'tracking-in-expand-fwd-badge 0.8s cubic-bezier(0.215, 0.610, 0.355, 1.000) both'
            }}
          >
            <span className="text-sm font-bold uppercase text-showcase-primary">{t('hero.badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight" style={{ fontFamily: "'Inter', sans-serif", perspective: '1000px' }}>
            <span
              className="block"
              style={{
                opacity: 0,
                animation: 'tracking-in-expand-fwd 0.8s cubic-bezier(0.215, 0.610, 0.355, 1.000) 0.3s both'
              }}
            >
              {t('hero.title_line1')}
            </span>
            <span
              className="block"
              style={{
                opacity: 0,
                animation: 'tracking-in-expand-fwd 0.8s cubic-bezier(0.215, 0.610, 0.355, 1.000) 0.6s both'
              }}
            >
              {t('hero.title_line2')}
            </span>
          </h1>
          <style>{`
            @keyframes tracking-in-expand-fwd {
              0% {
                letter-spacing: -0.5em;
                transform: translateZ(-700px);
                opacity: 0;
              }
              40% {
                opacity: 0.6;
              }
              100% {
                transform: translateZ(0);
                opacity: 1;
              }
            }
            @keyframes tracking-in-expand-fwd-badge {
              0% {
                letter-spacing: -0.5em;
                transform: translateZ(-700px);
                opacity: 0;
              }
              40% {
                opacity: 0.6;
              }
              100% {
                letter-spacing: 0.3em;
                transform: translateZ(0);
                opacity: 1;
              }
            }
            @keyframes softFadeUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <p
            className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed"
            style={{
              opacity: 0,
              animation: 'softFadeUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.8s forwards'
            }}
          >
            {t('hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <div
              className="w-full sm:w-auto"
              style={{ opacity: 0, animation: 'softFadeUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) 1.1s forwards' }}
            >
              <Button
                variant="outline"
                size="lg"
                className="w-full border-white text-white hover:bg-white hover:text-black transition-all duration-700 hover:-translate-y-1 hover:shadow-lg py-4 sm:py-3"
                onClick={() => navigate(ROUTES.CONG_TRINH)}
              >
                {t('hero.btn_explore')}
              </Button>
            </div>
            <div
              className="w-full sm:w-auto"
              style={{ opacity: 0, animation: 'softFadeUp 1.2s cubic-bezier(0.22, 1, 0.36, 1) 1.3s forwards' }}
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-showcase-primary border-none hover:bg-showcase-hover transition-all duration-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-showcase-primary/30 py-4 sm:py-3"
                onClick={() => {
                  const formElement = document.getElementById('tu-van-ngay-form');
                  if (formElement) {
                    formElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {t('hero.btn_consult')}
              </Button>
            </div>
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
