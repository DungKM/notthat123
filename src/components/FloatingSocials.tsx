import React, { useEffect, useState, useRef } from "react";
import { UpOutlined, PhoneOutlined } from "@ant-design/icons";
import { useCart } from "@/src/features/showcase/context/CartContext";

const FloatingSocials: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { isCartOpen } = useCart();
  const [isMobileVisible, setIsMobileVisible] = useState(true);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      // Mobile: Đồng bộ với Bottom Navigation
      if (window.innerWidth < 1024) {
        setIsMobileVisible(false);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          setIsMobileVisible(true);
        }, 300);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Vị trí Bottom tùy thuộc vào Bottom Navigation (mobile)
  const mobileBottomClass = isMobileVisible ? 'bottom-16' : 'bottom-4';

  return (
    <>
      {/* Button số điện thoại bên trái */}
      <a
        href="tel:0326908884"
        aria-label="Gọi 0326 908 884"
        className={`fixed flex left-4 md:left-6 z-999 items-center gap-2 bg-showcase-primary! text-white! px-4 py-3 rounded-full shadow-xl hover:scale-105 transition-all duration-300 animate-ripple ${isCartOpen ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100'} ${window.innerWidth < 1024 ? mobileBottomClass : 'bottom-10'}`}
      >
        <PhoneOutlined className="text-xl" />
        <span className="hidden md:inline font-semibold">
          0326 908 884
        </span>
      </a>

      {/* Social bên phải */}
      <div className={`fixed flex right-4 md:right-6 z-999 flex-col gap-3 transition-all duration-300 ${isCartOpen ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100'} ${window.innerWidth < 1024 ? mobileBottomClass : 'bottom-6'}`}>
        <a
          href="https://zalo.me/0326908884"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Zalo"
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-showcase-primary shadow-xl border border-gray-100 flex items-center justify-center hover:scale-110 transition-all duration-300 animate-ripple"
        >
          <img
            src="/assets/images/zalo-logo.png"
            alt="Zalo"
            className="w-8 h-8 md:w-9 md:h-9 object-contain"
          />
        </a>

        <a
          href="https://www.facebook.com/profile.php?id=61575740525417"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-showcase-primary shadow-xl border border-gray-100 flex items-center justify-center hover:scale-110 transition-all duration-300 animate-ripple"
        >
          <img
            src="/assets/images/logo_fb.png"
            alt="Facebook"
            className="w-8 h-8 md:w-9 md:h-9 object-contain"
          />
        </a>

        {showScrollTop && (
          <button
            onClick={handleScrollToTop}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-showcase-primary text-white shadow-xl border border-gray-100 flex items-center justify-center hover:scale-110 transition-all duration-300 "
            aria-label="Lên đầu trang"
          >
            <UpOutlined className="text-base md:text-lg" />
          </button>
        )}
      </div>
    </>
  );
};

export default FloatingSocials;