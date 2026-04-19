import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Container from "@/src/features/showcase/components/ui/Container";
import SEO from "@/src/components/common/SEO";
import { usePartnerService } from "@/src/api/services";
import doiTacImg from "@/src/statics/doi_tac.jpg";

const LOGO_PARTNERS = [
  { name: "Petrolimex", textColor: "#003290" },
  { name: "Customs", textColor: "#D1212B" },
  { name: "Ekotek", textColor: "#1D5BB6" },
  { name: "SotaTek", textColor: "#1DA3D2" },
  { name: "VMO", textColor: "#F16322" },
  { name: "FIT", textColor: "#00A8E8" },
  { name: "ASCU", textColor: "#2EAA5E" },
  { name: "KDDI", textColor: "#1B2A78" },
  { name: "WWF", textColor: "#000000" },
];

// ─── DraggableMarquee Component ───────────────────────────────────────────────
interface DraggableMarqueeProps {
  children: React.ReactNode;
  speed?: number; // px per second
  defaultDirection?: "left" | "right";
}

const DraggableMarquee: React.FC<DraggableMarqueeProps> = ({
  children,
  speed = 50,
  defaultDirection = "left",
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<"left" | "right">(defaultDirection);
  const [paused, setPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragThreshold = 30; // px minimum drag before switching direction

  // Tính duration dựa theo tổng chiều rộng của 1 bộ items
  const [duration, setDuration] = useState(20);
  useEffect(() => {
    if (trackRef.current) {
      const trackWidth = trackRef.current.scrollWidth / 2; // chia đôi vì chúng ta duplicate items
      setDuration(trackWidth / speed);
    }
  }, [speed]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    setPaused(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const delta = e.clientX - dragStartX.current;
      if (Math.abs(delta) >= dragThreshold) {
        // kéo từ trái → phải (delta dương): chạy sang phải
        // kéo từ phải → trái (delta âm): chạy sang trái
        setDirection(delta > 0 ? "right" : "left");
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setPaused(false);
  }, [isDragging]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setPaused(false);
    }
  }, [isDragging]);

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    setPaused(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const delta = e.touches[0].clientX - dragStartX.current;
    if (Math.abs(delta) >= dragThreshold) {
      setDirection(delta > 0 ? "right" : "left");
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setPaused(false);
  }, []);

  const animationName = direction === "left" ? "marquee-left" : "marquee-right";

  return (
    <>
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .draggable-marquee-track {
          display: flex;
          width: max-content;
          user-select: none;
        }
      `}</style>

      <div
        className="overflow-hidden w-full"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={trackRef}
          className="draggable-marquee-track"
          style={{
            animation: `${animationName} ${duration}s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {/* Nhân bản 2 lần để tạo vòng lặp vô tận */}
          {children}
          {children}
        </div>
      </div>
    </>
  );
};
// ──────────────────────────────────────────────────────────────────────────────

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

  const LogoItems = (
    <>
      {LOGO_PARTNERS.map((partner, index) => (
        <div
          key={index}
          className="mx-5 w-44 h-24 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300 flex items-center justify-center bg-gray-50 hover:bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 flex-shrink-0"
        >
          <span
            className="font-black text-xl tracking-wider select-none"
            style={{ color: partner.textColor }}
          >
            {partner.name}
          </span>
        </div>
      ))}
    </>
  );

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

      {/* Draggable Marquee Logo Partners */}
      <section className="py-16 bg-white border-b border-gray-100 overflow-hidden">
        <Container>
          <div className="text-center mb-10">
            <h2
              className="text-2xl font-bold text-teal-950 uppercase tracking-widest"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Đối Tác Tiêu Biểu
            </h2>
            <div className="w-16 h-1 bg-[#C5A059] mx-auto mt-4"></div>
            <p className="mt-3 text-gray-400 text-sm italic">
              ↔ Kéo chuột để thay đổi hướng chạy
            </p>
          </div>
        </Container>

        <div className="space-y-4 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10"></div>

          <DraggableMarquee speed={60} defaultDirection="left">
            {LogoItems}
          </DraggableMarquee>

          <DraggableMarquee speed={45} defaultDirection="right">
            {LogoItems}
          </DraggableMarquee>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-24 bg-gray-50/50">
        <Container>
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
                  const yOffset = -100;
                  const y = listRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: "smooth" });
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
            {loading
              ? Array.from({ length: 6 }).map((_, idx) => <PartnerCardSkeleton key={idx} />)
              : partners.map((partner, index) => (
                  <Link
                    to={`/doi-tac/${partner.slug}`}
                    key={index}
                    className="group relative h-[520px] bg-white rounded-2xl overflow-hidden border border-gray-100 border-b-[6px] border-b-orange-500 transition-all duration-500 block"
                  >
                    <div className="absolute inset-0 w-full h-full overflow-hidden">
                      <img
                        src={
                          partner.images?.[0]?.url ||
                          "https://images.unsplash.com/photo-1600880292203-757bb62b4baf"
                        }
                        alt={partner.title}
                        className="w-full h-full object-cover transition-transform duration-1000"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-white p-8 transition-transform duration-500 ease-out translate-y-[calc(100%-140px)] group-hover:translate-y-0 flex flex-col min-h-[140px]">
                      <span className="text-orange-500 font-extrabold text-xl mb-3 block">
                        {partner.cooperationYear}
                      </span>
                      <h3 className="text-2xl font-bold text-slate-700 leading-tight mb-2">
                        {partner.title}
                      </h3>
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

          {(!meta || partners.length < meta.total) && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={() => setLimit((prev) => prev + 6)}
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
