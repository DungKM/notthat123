import React from 'react';
import Container from '@/src/features/showcase/components/ui/Container';
import Badge from '@/src/features/showcase/components/ui/Badge';
import { CheckCircleFilled } from '@ant-design/icons';
import SEO from '@/src/components/common/SEO';
import { useTranslation } from 'react-i18next';

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const reasons = [
    { title: t('about.reasons.material_title'), desc: t('about.reasons.material_desc') },
    { title: t('about.reasons.design_title'), desc: t('about.reasons.design_desc') },
    { title: t('about.reasons.construction_title'), desc: t('about.reasons.construction_desc') },
  ];

  return (
    <div className="bg-white">
      <SEO
        title={t('about.seo.title')}
        description={t('about.seo.description')}
        canonicalPath="/gioi-thieu"
        keywords={t('about.seo.keywords')}
        breadcrumbs={[
          { name: t('about.breadcrumbs.home'), url: '/' },
          { name: t('about.breadcrumbs.current'), url: '/gioi-thieu' },
        ]}
      />

      {/* Hero */}
      <section className="relative h-[450px] flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600"
            alt="About Hero"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <Container className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>{t('about.hero_title')}</h1>
        </Container>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="gold">{t('about.story_badge')}</Badge>
                <h2 className="text-4xl font-bold text-teal-950 uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>{t('about.story_title')}</h2>
                <div className="w-20 h-1 bg-showcase-primary"></div>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg italic">
                "{t('about.story_quote')}"
              </p>
              <div className="space-y-4 text-gray-500 leading-relaxed">
                <p>{t('about.story_p1')}</p>
                <p>{t('about.story_p2')}</p>
                <p>{t('about.story_p3')}</p>
              </div>
            </div>
            <div className="relative group">
              <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200" className="rounded-2xl shadow-2xl w-full" alt="Hochi Story" loading="lazy" />
              <div className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 bg-teal-950 p-6 md:p-10 rounded-2xl border-l-4 border-showcase-primary shadow-2xl">
                <span className="text-white text-3xl md:text-5xl font-bold block mb-1">10+</span>
                <span className="text-gray-400 text-[10px] md:text-xs uppercase tracking-widest font-bold">{t('about.years_experience')}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-gray-50">
        <Container>
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-teal-950 uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>{t('about.why_title')}</h2>
            <div className="w-20 h-1 bg-showcase-primary mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reasons.map((item, i) => (
              <div key={i} className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all group">
                <CheckCircleFilled className="text-4xl text-showcase-primary mb-6" />
                <h4 className="text-xl font-bold mb-4 text-teal-950">{item.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
};

export default AboutPage;
