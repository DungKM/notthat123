import React from "react";
import { Link } from "react-router-dom";
import Container from "@/src/features/showcase/components/ui/Container";
import SEO from "@/src/components/common/SEO";
import { useEffect } from "react";
import { usePartnerService } from "@/src/api/services";
const PartnerPage: React.FC = () => {
  const { list: partners, getAll } = usePartnerService();

  useEffect(() => {
    getAll({ limit: 100 });
  }, [getAll]);

  return (
    <div className="bg-white">
      <SEO
        title="Đối tác"
        description="Digiworld trở thành đối tác chiến lược của các thương hiệu hàng đầu."
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
            <p className="text-gray-500 leading-relaxed text-lg text-justify md:text-left">
              Digiworld tự hào là đối tác chiến lược hàng đầu, mang đến các sản
              phẩm công nghệ, tiêu dùng và sức khỏe tiên tiến từ các thương hiệu
              nổi tiếng toàn cầu. Chúng tôi luôn cam kết cung cấp các sản phẩm
              và dịch vụ uy tín, chất lượng với định hướng phát triển bền vững
              cùng các đối tác của mình tại thị trường Việt Nam.
            </p>
          </div>

          {/* Grid of Partner Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {partners.map((partner, index) => (
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
          <div className="mt-16 flex justify-center">
            <button className="px-8 py-3 border border-orange-500 text-orange-500 font-bold rounded-full hover:bg-orange-500 hover:text-white transition-colors duration-300 flex items-center gap-2">
              Xem thêm <span className="ml-2">↓</span>
            </button>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default PartnerPage;
