import React, { useEffect, useState } from "react";
import { UpOutlined, PhoneOutlined } from "@ant-design/icons";
import { useCart } from "@/src/features/showcase/context/CartContext";

const FloatingSocials: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { isCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className={`transition-all duration-300 ${isCartOpen ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
      {/* Button số điện thoại bên trái */}
      <a
        href="tel:0326908884"
        className="fixed bottom-4 left-4 md:bottom-10 md:left-6 z-999
        flex items-center gap-2 !bg-showcase-primary !text-white 
        px-4 py-3 rounded-full shadow-xl hover:scale-105 transition-all duration-300 animate-ripple"
      >
        <PhoneOutlined className="text-xl" />
        <span className="font-semibold ">
          0326 908 884
        </span>
      </a>

      {/* Social bên phải */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-999 flex flex-col gap-3">
        <a
          href="https://zalo.me/0326908884"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 md:w-14 md:h-14 rounded-full bg-showcase-primary shadow-xl border border-gray-100 flex items-center justify-center hover:scale-110 transition-all duration-300 animate-ripple"
        >
          <img
            src="/assets/images/zalo-logo.png"
            alt="Zalo"
            className="w-9 h-9 md:w-9 md:h-9 object-contain"
          />
        </a>

        <a
          href="https://www.facebook.com/profile.php?id=61575740525417"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 md:w-14 md:h-14 rounded-full bg-showcase-primary shadow-xl border border-gray-100 flex items-center justify-center hover:scale-110 transition-all duration-300 animate-ripple"
        >
          <img
            src="/assets/images/logo_fb.png"
            alt="Facebook"
            className="w-9 h-9 md:w-9 md:h-9 object-contain"
          />
        </a>

        {showScrollTop && (
          <button
            onClick={handleScrollToTop}
            className="w-14 h-14 md:w-14 md:h-14 rounded-full bg-showcase-primary text-white shadow-xl border border-gray-100 flex items-center justify-center hover:scale-110 transition-all duration-300 "
            aria-label="Lên đầu trang"
          >
            <UpOutlined className="text-base md:text-lg" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FloatingSocials;