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

const PublicHome: React.FC = () => {
  return (
    <div className="bg-white font-sans selection:bg-teal-100">
      <SEO
        title="Trang chủ"
        description="Nội Thất Hochi - Xưởng sản xuất và thi công nội thất gỗ cao cấp tại Hà Nội. Thiết kế theo yêu cầu, nhận đặt đồ theo kích thước. Giao lắp miễn phí. Hotline: 0326 908 884."
        canonicalPath="/"
        keywords="nội thất hochi, nội thất gỗ cao cấp, xưởng nội thất hà nội, thiết kế nội thất, thi công nội thất, gỗ óc chó, tủ bếp, giường ngủ, sofa"
        breadcrumbs={[{ name: 'Trang chủ', url: '/' }]}
        faqData={[
          {
            question: 'Nội Thất Hochi chuyên sản xuất gì?',
            answer: 'Nội Thất Hochi chuyên sản xuất và thi công các sản phẩm nội thất gỗ cao cấp: tủ bếp, giường ngủ, sofa, bàn ăn, kệ TV, tủ quần áo... Thiết kế theo yêu cầu của khách hàng.',
          },
          {
            question: 'Nội Thất Hochi có giao hàng tận nơi không?',
            answer: 'Có! Nội Thất Hochi giao hàng và lắp đặt miễn phí cho đơn hàng trên 2 triệu tại Hà Nội, TP.HCM, Đà Nẵng, Hải Phòng, Bình Dương, Đồng Nai.',
          },
          {
            question: 'Thời gian sản xuất nội thất theo yêu cầu là bao lâu?',
            answer: 'Thời gian sản xuất từ 7-30 ngày tùy theo độ phức tạp của sản phẩm. Sản phẩm có sẵn giao trong 1-7 ngày. Chúng tôi tư vấn và thiết kế 3D miễn phí.',
          },
          {
            question: 'Nội Thất Hochi có nhận đặt theo kích thước không?',
            answer: 'Có! Chúng tôi nhận đặt làm nội thất theo kích thước và yêu cầu riêng của từng khách hàng, dù chỉ 1 món. Miễn phí thiết kế 3D.',
          },
          {
            question: 'Địa chỉ xưởng Nội Thất Hochi ở đâu?',
            answer: 'Nội Thất Hochi có xưởng sản xuất tại Hà Nội. Liên hệ hotline 0326 908 884 để được tư vấn và biết địa chỉ chi tiết.',
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
      <CTAImageSection />
      <CTA />
    </div>
  );
};

export default PublicHome;
