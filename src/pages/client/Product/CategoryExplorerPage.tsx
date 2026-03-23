import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategoryService } from '@/src/api/services';
import Container from '@/src/features/showcase/components/ui/Container';
import { ArrowRightOutlined } from '@ant-design/icons';
import { ROUTES } from '@/src/routes';

export const MOCK_PRODUCT_PLACEHOLDER = 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&q=80&w=800';

const CategoryExplorerPage = () => {
  const { list: apiCategories, getAll } = useCategoryService();
  const navigate = useNavigate();
  const [activeParentId, setActiveParentId] = useState<string>('');

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
  const childCategories = activeParent?.children || [];

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
          {/* Sidebar Left: Parent Categories */}
          <div className="w-full md:w-1/4 flex-shrink-0">
            <h3 className="text-sm font-black text-gray-400 tracking-widest uppercase mb-6">DANH MỤC CHÍNH</h3>
            <div className="flex flex-col gap-2">
              {parentCategories.map((cat: any) => {
                const isSelected = (cat.id || cat._id) === activeParentId;
                return (
                  <button
                    key={cat.id || cat._id}
                    onClick={() => setActiveParentId(cat.id || cat._id)}
                    className={`flex items-center justify-between items-center py-4 px-5 rounded-2xl transition-all duration-300 ${isSelected ? 'bg-showcase-primary text-white shadow-lg shadow-showcase-primary/20' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                  >
                    <span className="font-bold text-sm text-left">{cat.name}</span>
                    <ArrowRightOutlined className={`text-xs transition-transform duration-300 ${isSelected ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side: Child Category Grid */}
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-8 uppercase tracking-wide">
              {activeParent ? activeParent.name : 'Đang tải...'}
            </h3>
            
            {childCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {childCategories.map((child: any) => (
                  <div 
                    key={child.id || child._id}
                    onClick={() => navigate(`${ROUTES.DANH_SACH_SAN_PHAM}?slug=${child.slug}`)}
                    className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 cursor-pointer border border-gray-100 flex flex-col h-full"
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
                  <span className="text-2xl">📦</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Chưa có danh mục con</h4>
                <p className="text-gray-500 text-sm">Danh mục này hiện đang trống, bạn có muốn xem tất cả sản phẩm thuộc danh mục này không?</p>
                
                <button 
                  onClick={() => navigate(`${ROUTES.DANH_SACH_SAN_PHAM}?slug=${activeParent?.slug}`)}
                  className="mt-6 px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-showcase-primary transition-colors text-sm uppercase tracking-wider"
                >
                  Xem toàn bộ sản phẩm
                </button>
              </div>
            )}
            
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CategoryExplorerPage;
