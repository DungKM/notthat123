import React from 'react';
import Hero from '@/src/features/showcase/components/sections/Hero';
import Showcase from '@/src/features/showcase/components/sections/Showcase';
import Features from '@/src/features/showcase/components/sections/Features';
import Feedback from '@/src/features/showcase/components/sections/Feedback';
import Testimonials from '@/src/features/showcase/components/sections/Testimonials';
import CTA from '@/src/features/showcase/components/sections/CTA';
import CTAImageSection from '@/src/features/showcase/components/sections/CTAImageSection';
import ProductShopSection from '@/src/features/showcase/components/sections/ProductShopSection';
import InteriorCategorySection from '@/src/features/showcase/components/sections/InteriorCategorySection';
import SEO from '@/src/components/common/SEO';
import { useTranslation } from 'react-i18next';

const PublicHome: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white font-sans selection:bg-teal-100">
      <SEO
        title={t('home.seo.title')}
        description={t('home.seo.description')}
        canonicalPath="/"
        keywords={t('home.seo.keywords')}
        breadcrumbs={[{ name: t('home.breadcrumbs.home'), url: '/' }]}
        faqData={[
          {
            question: t('home.faq.q1'),
            answer: t('home.faq.a1'),
          },
          {
            question: t('home.faq.q2'),
            answer: t('home.faq.a2'),
          },
          {
            question: t('home.faq.q3'),
            answer: t('home.faq.a3'),
          },
          {
            question: t('home.faq.q4'),
            answer: t('home.faq.a4'),
          },
          {
            question: t('home.faq.q5'),
            answer: t('home.faq.a5'),
          },
        ]}
      />
      {/* Global CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>

      <Hero />
      <InteriorCategorySection />
      {/* <ProductShopSection /> */}
      <Showcase />
      <Features />
      <Feedback />
      {/* <Testimonials /> */}
      {/* <CTAImageSection /> */}
      <CTA />
    </div>
  );
};

export default PublicHome;
