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
import { useTranslation } from 'react-i18next';

const WhyChooseUsPage: React.FC = () => {
  const { t } = useTranslation();
  const values = [
    {
      icon: <CrownOutlined className="text-4xl text-showcase-primary" />,
      title: t('why_choose.values.quality_title'),
      desc: t('why_choose.values.quality_desc')
    },
    {
      icon: <ThunderboltOutlined className="text-4xl text-showcase-primary" />,
      title: t('why_choose.values.speed_title'),
      desc: t('why_choose.values.speed_desc')
    },
    {
      icon: <TeamOutlined className="text-4xl text-showcase-primary" />,
      title: t('why_choose.values.expert_title'),
      desc: t('why_choose.values.expert_desc')
    },
    {
      icon: <SafetyCertificateOutlined className="text-4xl text-showcase-primary" />,
      title: t('why_choose.values.warranty_title'),
      desc: t('why_choose.values.warranty_desc')
    }
  ];
  const processItems = t('why_choose.process_items', { returnObjects: true }) as string[];

  return (
    <div className="bg-white">
      <SEO
        title={t('why_choose.seo.title')}
        description={t('why_choose.seo.description')}
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
          <Badge variant="gold">{t('why_choose.badge')}</Badge>
          <h1 className="text-5xl font-bold uppercase tracking-widest mt-6" style={{ fontFamily: "'Inter', sans-serif" }}>{t('why_choose.hero_title')}</h1>
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
                <span className="text-showcase-primary font-bold tracking-widest text-sm uppercase">{t('why_choose.process_badge')}</span>
                <h2 className="text-4xl font-bold uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>{t('why_choose.process_title_line1')} <br /> {t('why_choose.process_title_line2')}</h2>
              </div>
              <div className="space-y-6">
                {processItems.map((text, i) => (
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
              {t('why_choose.quote')}
            </p>
            <div className="w-16 h-1 bg-showcase-primary mx-auto"></div>
            <p className="font-bold text-teal-950 uppercase tracking-widest">{t('why_choose.signature')}</p>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default WhyChooseUsPage;
