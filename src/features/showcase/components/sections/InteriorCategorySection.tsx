import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConstructionCategoryService } from '@/src/api/services';
import Container from '../ui/Container';
import { ROUTES } from '@/src/routes/index';
const DESKTOP_ITEMS_PER_PAGE = 15; // 5 cột × 3 hàng
const MOBILE_ITEMS_PER_PAGE = 16; // 2 cột × 8 hàng
const MOBILE_BREAKPOINT = 639;

interface SubCategory {
  _id: string;
  id: string;
  name: string;
  slug: string;
  image?: string;
  constructionCount?: number;
}

const InteriorCategorySection: React.FC = () => {
  const { getAll } = useConstructionCategoryService();
  const navigate = useNavigate();
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= MOBILE_BREAKPOINT : false
  );
  const [isCoarsePointer, setIsCoarsePointer] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false
  );

  // Dùng ref để tránh re-fetch vô tận do getAll thay đổi reference mỗi render
  const getAllRef = React.useRef(getAll);
  getAllRef.current = getAll;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllRef.current({ limit: 50 });
        // getAll trả về res.data trực tiếp (array)
        const categories: any[] = Array.isArray(res) ? res : [];

        const children: SubCategory[] = [];
        categories.forEach((cat: any) => {
          if (cat.children && cat.children.length > 0) {
            cat.children.forEach((child: any) => {
              if (child.image) {
                children.push({
                  _id: child._id,
                  id: child.id || child._id,
                  name: child.name,
                  slug: child.slug,
                  image: child.image,
                  constructionCount: child.constructionCount || 0,
                });
              }
            });
          }
        });

        setSubCategories(children);
      } catch (e) {
        console.error('Failed to fetch interior categories', e);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []); // chỉ chạy 1 lần khi mount

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const onChange = (event: MediaQueryListEvent) => {
      setIsCoarsePointer(event.matches);
    };

    setIsCoarsePointer(mediaQuery.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  const itemsPerPage = isMobile ? MOBILE_ITEMS_PER_PAGE : DESKTOP_ITEMS_PER_PAGE;

  const chunks = useMemo(() => {
    const pages: SubCategory[][] = [];
    for (let i = 0; i < subCategories.length; i += itemsPerPage) {
      pages.push(subCategories.slice(i, i + itemsPerPage));
    }
    return pages;
  }, [subCategories, itemsPerPage]);

  const totalPages = chunks.length;

  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ isDown: false, startX: 0, scrollLeft: 0 });
  const dragDeltaRef = useRef(0);
  const isDraggingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  const applyDragScroll = () => {
    if (!scrollRef.current || !dragStart.current.isDown) {
      rafIdRef.current = null;
      return;
    }

    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - dragDeltaRef.current;
    rafIdRef.current = null;
  };

  const queueDragScroll = () => {
    if (rafIdRef.current !== null) return;
    rafIdRef.current = window.requestAnimationFrame(applyDragScroll);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isCoarsePointer || !scrollRef.current) return;
    scrollRef.current.setPointerCapture(e.pointerId);

    if (!scrollRef.current) return;
    dragStart.current = {
      isDown: true,
      startX: e.pageX,
      scrollLeft: scrollRef.current.scrollLeft,
    };
    dragDeltaRef.current = 0;
    isDraggingRef.current = false;
    // Quan trọng: Tắt smooth scroll để kéo mượt & không bị trễ (lag)
    scrollRef.current.style.scrollBehavior = 'auto';
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isCoarsePointer) return;
    if (!dragStart.current.isDown || !scrollRef.current) return;
    const walk = (e.pageX - dragStart.current.startX) * 1.25;
    dragDeltaRef.current = walk;

    if (Math.abs(walk) > 5) {
      isDraggingRef.current = true;
      scrollRef.current.style.scrollSnapType = 'none';
      queueDragScroll();
    }
  };

  const handlePointerUp = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (isCoarsePointer) return;
    dragStart.current.isDown = false;

    if (scrollRef.current && e && scrollRef.current.hasPointerCapture(e.pointerId)) {
      scrollRef.current.releasePointerCapture(e.pointerId);
    }

    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (scrollRef.current) {
      scrollRef.current.style.scrollSnapType = 'x mandatory';
      // Bật lại default smooth scroll
      scrollRef.current.style.scrollBehavior = '';
    }

    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  };

  const handlePointerLeave = () => {
    if (isCoarsePointer) return;
    if (dragStart.current.isDown) {
      handlePointerUp();
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.clientWidth;
    const newPage = Math.round(scrollLeft / width);
    if (!dragStart.current.isDown && newPage !== page) {
      setPage(newPage);
    }
  };

  const handleDotClick = (i: number) => {
    setPage(i);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: i * scrollRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleClick = (cat: SubCategory) => {
    navigate(`${ROUTES.CONG_TRINH}?category=${cat.id}`);
  };

  useEffect(() => {
    if (!totalPages) return;
    if (page >= totalPages) {
      const nextPage = totalPages - 1;
      setPage(nextPage);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          left: nextPage * scrollRef.current.clientWidth,
          behavior: 'auto',
        });
      }
    }
  }, [page, totalPages]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-[#f5f5f5]">
        <Container>
          <div className="h-10 bg-gray-200 rounded w-48 mx-auto mb-10 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-xl mx-auto mb-3" />
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (subCategories.length === 0) return null;

  return (
    <section className="py-16 bg-[#f5f5f5]">
      <Container>
        {/* Title */}
        <h2
          className="text-3xl font-bold text-center text-gray-900 mb-10"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Danh mục nội thất
        </h2>

        <style dangerouslySetInnerHTML={{
          __html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar touch-pan-x cursor-grab active:cursor-grabbing select-none pb-2 -mx-1 px-1"
        >
          {chunks.map((chunk, index) => (
            <div key={index} className="w-full shrink-0 snap-start px-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {chunk.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={(e) => {
                      if (isDraggingRef.current) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      handleClick(cat);
                    }}
                    className="bg-white rounded-xl p-3 flex flex-row items-center gap-3 shadow-sm text-left w-full cursor-pointer hover:bg-gray-50 transition-colors"
                    draggable={false}
                  >
                    {/* Ảnh nhỏ bên trái */}
                    <div className="w-14 h-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 pointer-events-none">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        draggable={false}
                      />
                    </div>
                    {/* Text bên phải */}
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800 leading-tight line-clamp-2">
                        {cat.name}
                      </p>
                      {(cat.constructionCount ?? 0) > 0 && (
                        <span className="text-[11px] text-gray-400 mt-0.5 block">
                          {cat.constructionCount} công trình
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                className={`rounded-full transition-all duration-200 cursor-pointer ${i === page
                  ? 'w-6 h-3 bg-showcase-primary'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  }`}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
};

export default InteriorCategorySection;
