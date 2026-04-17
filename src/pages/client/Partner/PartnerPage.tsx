import React, { useRef } from "react";
import { Link } from "react-router-dom";
import Container from "@/src/features/showcase/components/ui/Container";
import SEO from "@/src/components/common/SEO";
import { useEffect } from "react";
import { usePartnerService } from "@/src/api/services";
import doiTacImg from "@/src/statics/doi_tac.jpg";

const PartnerCardSkeleton = () => (
  <div className="relative h-[520px] bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 border-b-[6px] border-b-gray-200 animate-pulse block">
    <div className="absolute bottom-0 left-0 right-0 bg-white p-8 flex flex-col min-h-[140px]">
      <div className="w-16 h-5 bg-gray-200 rounded mb-3"></div>
      <div className="w-3/4 h-6 bg-gray-200 rounded mb-2"></div>
    </div>
  </div>
);

const PartnerPage: React.FC = () => {
  const { list: partners, getAll, meta, loading } = usePartnerService();
  const [limit, setLimit] = React.useState(6);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAll({ limit });
  }, [getAll, limit]);

  return (
    <div className="bg-white">
      <SEO
        title="Đối tác"
        description="HOCHI tự hào hợp tác cùng các đối tác uy tín, mang đến những trải nghiệm không điểm trừ cho khách hàng."
      />

      {/* Hero Banner Section */}
      <section className="relative h-[400px] flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=2000"
            alt="Đối tác Background"
            className="w-full h-full object-cover"
          />
          {/* Lớp phủ tương tự như thiết kế với màu xanh đậm */}
          <div className="absolute inset-0 bg-[#0f172a]/80"></div>
          {/* Các vạch kẽ lưới và mũi tên mờ mờ có thể dùng background pattern nếu có */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
        <Container className="relative z-10 text-center text-white flex flex-col items-center justify-center">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-widest leading-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ĐỐI TÁC
          </h1>
        </Container>
      </section>

      {/* Main Content Section */}
      <section className="py-24 bg-gray-50/50">
        <Container>
          {/* Section Title */}
          <div className="mb-16 max-w-4xl">
            <h2
              className="text-3xl font-bold text-teal-950 mb-6 uppercase tracking-wider"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Đối tác
            </h2>
            <div 
              className="mb-16 w-full cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => {
                if (listRef.current) {
                  const yOffset = -100; // Trừ khoảng hở header
                  const y = listRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }}
              title="Nhấn để xem danh sách đối tác chi tiết"
            >
              <img
                src={doiTacImg}
                alt="Đối tác đồng hành cùng HOCHI"
                className="w-full h-auto object-cover"
              />
            </div>
            <p className="text-gray-500 leading-relaxed text-lg text-justify md:text-left">
              Chúng tôi tự hào hợp tác cùng các đối tác uy tín trong nhiều lĩnh vực, mang đến những sản phẩm và giải pháp chất lượng cao, đáp ứng các tiêu chuẩn khắt khe. Với định hướng phát triển bền vững, HOCHI luôn đề cao sự đồng hành lâu dài, cùng nhau kiến tạo giá trị và nâng tầm trải nghiệm cho khách hàng tại thị trường Việt Nam.
            </p>
          </div>


          {/* Grid of Partner Cards */}
          <div ref={listRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => <PartnerCardSkeleton key={idx} />)
            ) : partners.map((partner, index) => (
              <Link
                to={`/doi-tac/${partner.slug}`}
                key={index}
                className="group relative h-[520px] bg-white rounded-2xl overflow-hidden  border border-gray-100 border-b-[6px] border-b-orange-500 transition-all duration-500 block"
              >
                {/* Image Section - Now fills the background */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <img
                    src={partner.images?.[0]?.url || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf"}
                    alt={partner.title}
                    className="w-full h-full object-cover transition-transform duration-1000 "
                  />
                </div>

                {/* Content Area - Slides up from bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-white p-8 transition-transform duration-500 ease-out translate-y-[calc(100%-140px)] group-hover:translate-y-0 flex flex-col min-h-[140px]"
                >
                  <span className="text-orange-500 font-extrabold text-xl mb-3 block">
                    {partner.cooperationYear}
                  </span>

                  <h3 className="text-2xl font-bold text-slate-700 leading-tight mb-2">
                    {partner.title}
                  </h3>

                  {/* Description - Always present but hidden by translation until hover */}
                  <div className="pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <div className="w-12 h-0.5 bg-gray-200 mb-4"></div>
                    <p className="text-gray-500 leading-relaxed text-base line-clamp-3">
                      {partner.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination / Load More Button Space if needed */}
          {(!meta || partners.length < meta.total) && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={() => setLimit(prev => prev + 6)}
                className="px-8 py-3 border border-orange-500 text-orange-500 font-bold rounded-full hover:bg-orange-500 hover:text-white transition-colors duration-300 flex items-center gap-2"
              >
                Xem thêm <span className="ml-2">↓</span>
              </button>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
};

export default PartnerPage;
