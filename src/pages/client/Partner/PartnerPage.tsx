import React, { useState, useEffect } from "react";
import Container from "@/src/features/showcase/components/ui/Container";
import SEO from "@/src/components/common/SEO";
import { usePartnerService } from "@/src/api/services";

const PartnerPage: React.FC = () => {
  const { list: partners, getAll, loading } = usePartnerService();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | number | null>(null);

  useEffect(() => {
    // Tải tất cả đối tác để hiển thị
    getAll({ limit: 100 });
  }, [getAll]);

  return (
    <div className="bg-white">
      <SEO
        title="Đối tác"
        description="HOCHI tự hào hợp tác cùng các đối tác uy tín, mang đến những trải nghiệm không điểm trừ cho khách hàng."
        breadcrumbs={[
          { name: 'Trang chủ', url: '/' },
          { name: 'Đối tác', url: '/doi-tac' },
        ]}
      />

      {/* Hero Banner */}
      <section className="relative h-60 md:h-75 flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=2000"
            alt="Đối tác Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0f172a]/80"></div>
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
        <Container className="relative z-10 text-center text-white flex flex-col items-center justify-center">
          <h1
            className="text-3xl md:text-5xl font-bold uppercase tracking-widest leading-tight mt-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ĐỐI TÁC
          </h1>
        </Container>
      </section>

      {/* Main Content Section */}
      <section className="py-24 bg-gray-50/50 min-h-screen">
        <Container>
          <div className="mb-16 max-w-4xl mx-auto text-center">
            <h2
              className="text-3xl md:text-4xl font-bold text-teal-950 mb-8 uppercase tracking-wider"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Đối Tác Đồng Hành
            </h2>
            <p className="text-gray-500 leading-relaxed text-lg text-center mx-auto mb-16">
              Chúng tôi tự hào hợp tác cùng các đối tác uy tín trong nhiều lĩnh vực, mang đến những sản phẩm và giải pháp chất lượng cao, đáp ứng các tiêu chuẩn khắt khe. Với định hướng phát triển bền vững, HOCHI luôn đề cao sự đồng hành lâu dài, cùng nhau kiến tạo giá trị và nâng tầm trải nghiệm cho khách hàng tại thị trường Việt Nam.
            </p>

            {/* Horizontal Logos / Cover Images List */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 w-full mb-12">
              {loading ? (
                <div className="flex justify-center w-full py-4">
          k        <div className="animate-spin rounded-full h-8 w-8 border-b-2 "></div>
                </div>
              ) : partners.map((partner) => {
                const isSelected = selectedPartnerId === partner.id;
                return (
                  <div
                    key={`top-${partner.id}`}
                    className="relative flex flex-col items-center group cursor-pointer"
                    onClick={() => {
                      setSelectedPartnerId(partner.id);
                      setTimeout(() => {
                        const el = document.getElementById('partner-content-area');
                        if (el) {
                          const offset = 200;
                          const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                  >
                    <div
                      className={`transition-all duration-300 flex items-center justify-center p-3 md:p-4 rounded-xl bg-white
                        ${isSelected
                          ? 'scale-110 border-orange-500 ring-4 ring-orange-500/20'
                          : ' opacity-80 hover:opacity-100'
                        }`}
                    >
                      <img
                        src={partner.images?.[0]?.url || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf"}
                        alt={partner.title}
                        className="w-20 md:w-28 h-12 md:h-16 object-contain"
                      />
                    </div>
                  </div>
                );
              })}
            </div>


            {/* Selected Partner Content Area */}
            <div id="partner-content-area" className="w-full flex flex-col pt-12 border-t border-gray-100 min-h-[200px]">
              {loading ? (
                <div className="flex justify-center w-full py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              ) : selectedPartnerId ? (
                (() => {
                  const partner = partners.find((p) => p.id === selectedPartnerId);
                  if (!partner) return null;
                  return (
                    <div className="text-left bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 animate-fadeIn mx-auto max-w-3xl w-full">
                       <h3 className="text-xl md:text-2xl font-bold text-slate-800 uppercase mb-4 tracking-wider">
                         {partner.title}
                       </h3>
                       <div className="inline-block px-4 py-1.5 bg-orange-50 text-orange-600 font-semibold rounded-full text-sm mb-6">
                         Đối tác từ năm {partner.cooperationYear || new Date().getFullYear()}
                       </div>
                       <p className="whitespace-pre-line text-gray-600 leading-relaxed text-base md:text-lg">
                         {partner.description || 'Thông tin chi tiết về đối tác đang được cập nhật...'}
                       </p>
                    </div>
                  );
                })()
              ) : (
                <div className="py-20 text-center text-gray-400">
                  <p className="text-lg">Vui lòng nhấp vào một đối tác ở trên để xem thông tin chi tiết.</p>
                </div>
              )}
            </div>

          </div>
        </Container>
      </section>
    </div>
  );
};

export default PartnerPage;

