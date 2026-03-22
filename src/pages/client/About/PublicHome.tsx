import React from 'react';
import Hero from '@/src/features/showcase/components/sections/Hero';
import Showcase from '@/src/features/showcase/components/sections/Showcase';
import Features from '@/src/features/showcase/components/sections/Features';
import Feedback from '@/src/features/showcase/components/sections/Feedback';
import Testimonials from '@/src/features/showcase/components/sections/Testimonials';
import CTA from '@/src/features/showcase/components/sections/CTA';
import ProductShopSection from '@/src/features/showcase/components/sections/ProductShopSection';
import SEO from '@/src/components/common/SEO';

const PublicHome: React.FC = () => {
  return (
    <div className="bg-white font-sans selection:bg-teal-100">
      <SEO 
        title="Trang chủ" 
        description="Chào mừng đến với Nội Thất Hochi - Đơn vị hàng đầu về thiết kế và thi công nội thất gỗ óc chó cao cấp tại Việt Nam."
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
      <ProductShopSection />
      <Showcase />
      <Features />
      <Feedback />
      <Testimonials />
      <CTA />
    </div>
  );
};

export default PublicHome;
