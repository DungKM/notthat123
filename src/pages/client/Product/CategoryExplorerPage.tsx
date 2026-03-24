import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategoryService } from '@/src/api/services';
import Container from '@/src/features/showcase/components/ui/Container';
import { ArrowRightOutlined, SearchOutlined, FilterOutlined, InboxOutlined } from '@ant-design/icons';
import { ROUTES } from '@/src/routes';

export const MOCK_PRODUCT_PLACEHOLDER = 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&q=80&w=800';

const CategoryExplorerPage = () => {
  const { list: apiCategories, getAll } = useCategoryService();
  const navigate = useNavigate();
  const [activeParentId, setActiveParentId] = useState<string>('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    getAll({ limit: 100 });
  }, []);

  const parentCategories = apiCategories ? apiCategories.filter(cat => !cat.parentSlug) : [];

  // Set default active parent category
  useEffect(() => {
    if (parentCategories.length > 0 && !activeParentId) {
      setActiveParentId(parentCategories[0].id || parentCategories[0]._id);
    }
  }, [parentCategories, activeParentId]);

  const activeParent = parentCategories.find(cat => (cat.id || cat._id) === activeParentId);
  const allChildren = activeParent?.children || [];

  // Filter child categories by keyword
  const childCategories = keyword.trim()
    ? allChildren.filter((child: any) =>
      child.name?.toLowerCase().includes(keyword.toLowerCase()) ||
      child.description?.toLowerCase().includes(keyword.toLowerCase())
    )
    : allChildren;

  const handleReset = () => {
    setKeyword('');
    if (parentCategories.length > 0) {
      setActiveParentId(parentCategories[0].id || parentCategories[0]._id);
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen">
      <section className="relative h-[240px] md:h-[300px] flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80"
            alt="Category Hero"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <Container className="relative z-10 text-center text-white">
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-widest mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>KHÁM PHÁ DANH MỤC</h1>
          <div className="mt-4 text-sm font-medium opacity-80 flex items-center justify-center gap-2">
            <span>Tìm kiếm hàng ngàn sản phẩm nội ngoại thất cao cấp được phân loại rõ ràng.</span>
          </div>
        </Container>
      </section>

      <Container className="py-16 md:py-24">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          {/* Sidebar Left: Filter Panel */}
          <div className="w-full md:w-1/4 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100  p-6 sticky top-24">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Tìm kiếm</p>
                  <h2 className="text-xl font-black text-gray-900 mt-0.5">BỘ LỌC</h2>
                </div>
                <button
                  onClick={handleReset}
                  title="Đặt lại bộ lọc"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-showcase-primary hover:bg-amber-50 transition-colors"
                >
                  <FilterOutlined />
                </button>
              </div>

              {/* Keyword Search */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Từ khóa</label>
                <div className="relative">
                  <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 mb-5" />

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Danh mục</label>
                <div className="flex flex-col gap-2">
                  {parentCategories.map(cat => {
                    const catId = cat.id || cat._id;
                    const isActive = activeParentId === catId;
                    return (
                      <button
                        key={catId}
                        onClick={() => { setActiveParentId(catId); setKeyword(''); }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                          ? 'bg-showcase-primary text-white  '
                          : 'text-gray-600'
                          }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                  {parentCategories.length === 0 && (
                    <p className="text-sm text-gray-400 italic">Đang tải danh mục...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Child Category Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              {/* <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-wide">
                {activeParent ? activeParent.name : 'Đang tải...'}
              </h3> */}
              {keyword && (
                <span className="text-sm text-gray-500">
                  {childCategories.length} kết quả cho <strong>"{keyword}"</strong>
                </span>
              )}
            </div>

            {childCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {childCategories.map((child: any) => (
                  <div
                    key={child.id || child._id}
                    onClick={() => navigate(`${ROUTES.DANH_SACH_SAN_PHAM}?slug=${child.slug}`)}
                    className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer border border-gray-100 flex flex-col h-full"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden relative bg-gray-50 flex-shrink-0">
                      {/* Thay đổi URL ảnh tùy thuộc vào backend nếu mảng có hình */}
                      <img
                        src={MOCK_PRODUCT_PLACEHOLDER}
                        alt={child.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 mix-blend-multiply"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-showcase-primary transition-colors">
                          {child.name}
                        </h4>
                        {child.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                            {child.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-6 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-gray-400 group-hover:text-showcase-primary transition-colors pt-4 border-t border-gray-50">
                        <span>XEM DANH SÁCH</span>
                        <ArrowRightOutlined className="group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-2xl">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  {keyword
                    ? <SearchOutlined className="text-2xl text-gray-400" />
                    : <InboxOutlined className="text-2xl text-gray-400" />}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {keyword ? 'Không tìm thấy danh mục' : 'Chưa có danh mục con'}
                </h4>
                <p className="text-gray-500 text-sm">
                  {keyword
                    ? `Không có danh mục nào phù hợp với từ khóa "${keyword}".`
                    : 'Danh mục này hiện đang trống, bạn có muốn xem tất cả sản phẩm thuộc danh mục này không?'}
                </p>

                {!keyword && (
                  <button
                    onClick={() => navigate(`${ROUTES.DANH_SACH_SAN_PHAM}?slug=${activeParent?.slug}`)}
                    className="mt-6 px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-showcase-primary transition-colors text-sm uppercase tracking-wider"
                  >
                    Xem toàn bộ sản phẩm
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </Container>
    </div>
  );
};

export default CategoryExplorerPage;
