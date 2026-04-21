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
      />

      {/* Hero Banner */}
      <section className="relative h-[400px] flex items-center pt-20">
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
            className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-widest leading-tight"
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
                      setSelectedPartnerId(partner.id); // Luôn set khi bấm vào
                      setTimeout(() => {
                        const el = document.getElementById(`partner-acc-${partner.id}`);
                        if (el) {
                          const offset = 120;
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

            <div className="w-full h-px bg-gray-200 mb-16"></div>

            <h3 className="text-2xl font-bold text-slate-800 mb-8 uppercase text-left">Danh sách chi tiết</h3>

            {/* Partners Accordion List */}
            <div className="w-full flex flex-col border-t border-gray-200">
              {loading ? (
                <div className="flex justify-center w-full py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              ) : partners.map((partner) => {
                const isSelected = selectedPartnerId === partner.id;
                return (
                  <div key={partner.id} id={`partner-acc-${partner.id}`} className="">
                    <button
                      className="w-full py-6 md:py-8 flex items-center justify-between text-left focus:outline-none group"
                      onClick={() => setSelectedPartnerId(isSelected ? null : partner.id)}
                    >
                      <div className="flex items-center gap-6 md:gap-10 overflow-hidden">
                        <div className="w-24 h-14 md:w-40 md:h-20 flex-shrink-0 flex items-center justify-center p-3 md:p-4 bg-white rounded-xl border border-gray-100 shadow-sm  transition-all duration-300">
                          <img
                            src={partner.images?.[0]?.url || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf"}
                            alt={partner.title}
                            className="max-w-full max-h-full object-contain  transition-all duration-300"
                          />
                        </div>
                        <h3 className="text-lg md:text-2xl font-bold text-slate-800 uppercase group-hover:text-orange-600 transition-colors truncate">
                          {partner.title}
                        </h3>
                      </div>
                      <div className="ml-4 flex-shrink-0 bg-gray-50 rounded-full p-2 group-hover:bg-orange-50 transition-colors">
                        <svg
                          className={`w-6 h-6 md:w-8 md:h-8 text-gray-400 transform transition-transform duration-300 ${isSelected ? 'rotate-180 text-orange-500' : 'group-hover:text-orange-500'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Accordion Content */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${isSelected ? 'grid-rows-[1fr] opacity-100 mb-8' : 'grid-rows-[0fr] opacity-0 mb-0'}`}
                    >
                      <div className="overflow-hidden">
                        <div className="pl-4 md:pl-[12.5rem] pr-4 text-left ml-5 md:ml-12 text-gray-600 leading-relaxed text-base md:text-lg">
                          <div className="inline-block px-4 py-1 bg-orange-50 text-orange-600 font-semibold rounded-full text-sm mb-4">
                            Đối tác từ năm {partner.cooperationYear || new Date().getFullYear()}
                          </div>
                          <p className="whitespace-pre-line">
                            {partner.description || 'Thông tin chi tiết về đối tác đang được cập nhật...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </Container>
      </section>
    </div>
  );
};

export default PartnerPage;

