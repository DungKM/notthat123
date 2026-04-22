import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConstructionCategoryService } from '@/src/api/services';
import Container from '../ui/Container';
import { ROUTES } from '@/src/routes/index';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10; // 5 cột × 2 hàng

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

  const totalPages = Math.ceil(subCategories.length / ITEMS_PER_PAGE);
  const currentItems = subCategories.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const prev = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);
  const next = useCallback(() => setPage((p) => Math.min(totalPages - 1, p + 1)), [totalPages]);

  const handleClick = (cat: SubCategory) => {
    navigate(`${ROUTES.CONG_TRINH}?category=${cat.id}`);
  };

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

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {currentItems.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleClick(cat)}
              className="bg-white rounded-xl p-3 flex flex-row items-center gap-3 shadow-sm text-left w-full cursor-pointer"
            >
              {/* Ảnh nhỏ bên trái */}
              <div className="w-14 h-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
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

        {/* Pagination dots */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`rounded-full transition-all duration-200 cursor-pointer ${
                  i === page
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
