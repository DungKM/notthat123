import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Container from '@/src/features/showcase/components/ui/Container';
import Button from '@/src/features/showcase/components/ui/Button';
import Badge from '@/src/features/showcase/components/ui/Badge';
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import SEO from '@/src/components/common/SEO';
import { useCart } from '@/src/features/showcase/context/CartContext';
import deliveryLogo from '@/src/statics/logo_giao_hang.png';
import ProductCard from '@/src/features/showcase/components/ui/ProductCard';
import toast from 'react-hot-toast';
import { useProductService } from '@/src/api/services';

// ─── Mini card giống UI Sản phẩm bán chạy ───
const StarRating: React.FC<{ rating?: number }> = ({ rating = 0 }) => (
  <div className="flex gap-0.5 mt-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg key={star} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
        fill={star <= rating ? '#f59e0b' : 'none'}
        stroke={star <= rating ? '#f59e0b' : '#d1d5db'}
        strokeWidth={1.5} className="w-3.5 h-3.5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ))}
  </div>
);

const RelatedProductCard: React.FC<{ product: any }> = ({ product }) => {
  const image = product.images && product.images.length > 0
    ? product.images[0].url
    : 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800';
  const priceText = product.price && product.price > 0
    ? `${product.price.toLocaleString()}đ`
    : 'Liên hệ';
  return (
    <Link to={`/san-pham/${product.slug || product.id}`}
      className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="overflow-hidden bg-gray-50">
        <img src={image} alt={product.name}
          className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy" />
      </div>
      <div className="flex flex-col flex-1 p-3 gap-1">
        <h3 className="text-sm text-gray-800 font-medium leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <StarRating rating={0} />
        <p className="text-[#a0522d] font-bold text-base mt-1">{priceText}</p>
      </div>
      <div className="px-3 pb-3">
        <img src={deliveryLogo} alt="Giao lắp tại nhà" className="w-full h-auto object-contain rounded-lg" />
      </div>
    </Link>
  );
};

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>(); // Lấy slug thật từ URL
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const { data: apiProduct, loading, getBySlug, list: relatedProducts, getAll: getRelated } = useProductService();

  React.useEffect(() => {
    if (slug) {
      getBySlug(slug).then((res) => {
        // Fetch products cùng category làm gợi ý nếu có categoryId
        if (res?.categoryId?.id) {
          getRelated({ categoryId: res.categoryId.id, limit: 4 });
        } else {
          getRelated({ limit: 4 });
        }
      });
    }
  }, [slug]);

  // Map API data sang View Model
  const product = apiProduct ? {
    id: apiProduct.id,
    slug: apiProduct.id,
    title: apiProduct.name || 'Đang cập nhật',
    category: apiProduct.categoryId?.name || 'Sản phẩm',
    price: apiProduct.price || 0,
    priceText: apiProduct.price ? `${apiProduct.price.toLocaleString()} VND` : 'Liên hệ',
    description: apiProduct.description || 'Chi tiết sản phẩm nội thất cao cấp với thiết kế hiện đại, chất liệu bền bỉ và đẹp mắt. Tôn vinh Không gian sống đẳng cấp.',
    images: apiProduct.images && apiProduct.images.length > 0
      ? apiProduct.images.map((img: any) => img.url).filter(Boolean)
      : [
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800',
      ],
    specs: [
      { label: 'Chất liệu', value: apiProduct.material || 'Đang cập nhật' },
      { label: 'Phong cách', value: apiProduct.style || 'Đang cập nhật' },
      { label: 'Tồn kho', value: apiProduct.stockQuantity ? `${apiProduct.stockQuantity} sản phẩm` : 'Đặt hàng' },
      { label: 'Bảo hành', value: apiProduct.warranty || 'Đang cập nhật' },
    ],
  } : null;

  const handleAddToCart = () => {
    if (!product) return;
    toast.success('Đã thêm vào giỏ hàng!');

    addToCart({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      image: product.images[0],
      quantity: 1,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <div className="bg-white">
      {loading && !product ? (
        <div className="pt-40 pb-24 text-center text-gray-400">Đang tải thông tin sản phẩm...</div>
      ) : !product ? (
        <div className="pt-40 pb-24 text-center text-red-400">Không tìm thấy sản phẩm!</div>
      ) : (
        <>
          <SEO title={product.title} description={product.description} />

          <main className="pt-32 pb-24">
            <Container>
              <Link
                to="/san-pham"
                className="inline-flex items-center gap-2 !text-gray-500 hover:text-showcase-primary mb-8 transition-colors text-sm font-medium"
              >
                <ArrowLeftOutlined /> Quay lại danh sách
              </Link>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Gallery Section */}
                <div className="space-y-6">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {product.images.map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-showcase-primary transition-all"
                      >
                        <img
                          src={img}
                          alt={`${product.title} ${i}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex flex-col">
                  <div className="mb-8 space-y-4">
                    <Badge variant="gold">{product.category}</Badge>
                    <h1
                      className="text-4xl font-bold text-teal-950 uppercase leading-tight"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {product.title}
                    </h1>
                    <p className="text-2xl font-bold text-showcase-primary">
                      {product.priceText}
                    </p>
                  </div>

                  <div className="prose prose-gray max-w-none mb-10">
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl mb-10 border border-gray-100">
                    {product.specs.map((spec, i) => (
                      <div key={i}>
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                          {spec.label}
                        </p>
                        <p className="font-bold text-gray-900">{spec.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      className="w-full sm:flex-1 bg-teal-900 border-none hover:bg-black uppercase tracking-widest font-bold"
                      onClick={handleAddToCart}
                    >
                      Thêm giỏ hàng
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:flex-1 uppercase tracking-widest font-bold hover:bg-showcase-light"
                      onClick={handleBuyNow}
                    >
                      Mua ngay
                    </Button>
                  </div>

                  {/* Trust Badge */}
                  <div className="mt-8 flex items-center gap-6 text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1">
                      <CheckCircleFilled className="text-showcase-primary" /> Cam kết chất lượng
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircleFilled className="text-showcase-primary" /> Thi công đúng tiến độ
                    </span>
                  </div>
                  <div className="mt-6">
                    <img src={deliveryLogo} alt="Giao hàng" className="h-16 object-contain" />
                  </div>

                </div>
              </div>

              {/* Product Deep Introduction */}
              <div className="mt-32 border-t border-gray-100 pt-20">
                <div className="max-w-4xl mx-auto space-y-12">
                  <div className="text-center space-y-4">
                    <Badge variant="gold">CHI TIẾT DỰ ÁN</Badge>
                    <h2
                      className="text-3xl font-bold text-teal-950 uppercase"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      GIỚI THIỆU SẢN PHẨM
                    </h2>
                    <div className="w-20 h-1 bg-showcase-primary mx-auto"></div>
                  </div>

                  <div className="prose prose-lg prose-gray max-w-none space-y-8">
                    <p className="text-gray-600 leading-relaxed italic border-l-4 border-showcase-primary pl-6 py-2">
                      "Mỗi công trình là một tác phẩm nghệ thuật riêng biệt, nơi Gỗ Óc Chó không chỉ đóng vai trò là vật liệu mà còn là linh hồn của ngôi nhà."
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">Tinh hoa từ thiên nhiên</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                          Sản phẩm được chế tác từ những kiện gỗ óc chó loại FAS nhập trực tiếp từ vùng Bắc Mỹ. Với vân gỗ uốn lướt nghệ thuật và màu nâu socola đặc trưng, chúng tôi giữ trọn vẹn vẻ đẹp nguyên bản nhất của thiên nhiên.
                        </p>
                      </div>
                      <img
                        src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800"
                        className="rounded-2xl shadow-lg"
                        alt="Gỗ óc chó"
                        loading="lazy"
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-900">Quy trình sản xuất chuẩn quốc tế</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        Tại nhà máy của Nội Thất 102, mỗi tấm gỗ đều trải qua quy trình tẩm sấy khắt khe kéo dài 45-60 ngày để đảm bảo độ ổn định, không cong vênh hay mối mọt trong điều kiện khí hậu Việt Nam. Lớp sơn Inchem (Mỹ) cao cấp giúp bảo vệ bề mặt nhưng vẫn giữ được cảm giác mát mịn khi chạm tay.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Products */}
              <div className="mt-24 border-t border-gray-100 pt-16">
                <div className="text-center mb-10 space-y-3">
                  <Badge variant="gold">GỢI Ý CHO BẠN</Badge>
                  <h2 className="text-2xl font-bold text-teal-950 uppercase"
                    style={{ fontFamily: "'Inter', sans-serif" }}>
                    SẢN PHẨM TƯƠNG TỰ
                  </h2>
                  <div className="w-16 h-1 bg-[#a0522d] mx-auto" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(relatedProducts || []).slice(0, 4).map((rp: any, i: number) => (
                    <RelatedProductCard key={rp.id || i} product={rp} />
                  ))}
                </div>
              </div>
            </Container>
          </main>
        </>
      )}
    </div>
  );
};

export default ProductDetailPage;