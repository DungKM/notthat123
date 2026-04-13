import React from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import Container from "@/src/features/showcase/components/ui/Container";
import SEO from "@/src/components/common/SEO";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { usePartnerService } from "@/src/api/services";
const PartnerDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: partner, getById, loading } = usePartnerService();
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (slug) {
      getById(slug).finally(() => setHasFetched(true));
    }
  }, [slug, getById]);

  if (loading || !hasFetched) return <div style={{ padding: 24, textAlign: 'center' }}>Đang tải dữ liệu...</div>;

  if (!partner && hasFetched) {
    return <Navigate to="/doi-tac" replace />;
  }

  return (
    <div className="bg-gray-50 flex flex-col">
      <SEO
        title={`${partner.title} - Đối tác`}
        description={partner.description || partner.title}
      />

      <main className="flex-grow pt-28 pb-20">
        <Container>
          {/* BREADCRUMB */}
          <div className="text-[13px] !text-gray-500 mb-6 font-medium">
            <Link to="/" className="hover:text-showcase-primary !text-gray-500">Trang chủ</Link>
            <span className="mx-2">/</span>
            <Link to="/doi-tac" className="hover:text-showcase-primary !text-gray-500">Đối tác</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{partner.title}</span>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            {/* Hero Banner for Detail */}
            <div className="w-full h-[400px] md:h-[500px] relative">
              <img
                src={partner.images?.[0]?.url || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf"}
                alt={partner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                <span className="inline-block px-4 py-1.5 bg-orange-500 text-white rounded-full font-bold text-sm tracking-wider mb-4">
                  ĐỐI TÁC CHIẾN LƯỢC {partner.cooperationYear}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 shadow-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {partner.title}
                </h1>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8 md:p-16">
              {partner.description && (
                <p className="text-2xl text-teal-950 font-semibold mb-8 leading-relaxed">
                  {partner.description}
                </p>
              )}

              <div className="w-20 h-1 bg-orange-500 mb-8"></div>

              <div className="prose prose-lg max-w-none text-gray-600 leading-loose">
                <p>{partner.content}</p>
                <p className="mt-6">
                  Chúng tôi tin tưởng rằng mối quan hệ hợp tác này sẽ mang lại những giá trị thiết thực và lâu dài. Không chỉ cung cấp các sản phẩm chất lượng cao, hai bên còn hướng tới việc đem đến trải nghiệm người dùng tuyệt vời và các dịch vụ hậu mãi xuất sắc.
                </p>
              </div>

              <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-2">Thương hiệu</h3>
                  <p className="text-xl font-semibold text-teal-950">{partner.title}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-2">Năm hợp tác</h3>
                  <p className="text-xl font-semibold text-orange-500">{partner.cooperationYear}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
};

export default PartnerDetailPage;
