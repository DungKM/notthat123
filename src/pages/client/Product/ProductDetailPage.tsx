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

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Mock data for demonstration
  const product = {
    id: slug || 'biet-thu-go-oc-cho-premium',
    slug: slug || 'biet-thu-go-oc-cho-premium',
    title: 'Biệt Thự Gỗ Óc Chó Premium',
    category: 'Nội Thất Biệt Thự',
    price: 300000000,
    priceText: '300,000,000 VND',
    description:
      'Không gian sống đẳng cấp với chất liệu gỗ óc chó nhập khẩu 100% từ Bắc Mỹ. Thiết kế tối giản nhưng tinh tế, tôn vinh vẻ đẹp tự nhiên của vân gỗ.',
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800',
    ],
    specs: [
      { label: 'Chất liệu', value: 'Gỗ Óc Chó Bắc Mỹ' },
      { label: 'Phong cách', value: 'Hiện đại / Sang trọng' },
      { label: 'Hoàn thiện', value: 'Sơn Inchem cao cấp' },
      { label: 'Bảo hành', value: '05 Năm' },
    ],
  };

  const products = [
    { slug: 'biet-thu-go-oc-cho-1', title: 'Biệt thự gỗ óc chó 1', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800', tag: 'HOT', category: 'Biệt Thự' },
    { slug: 'biet-thu-go-oc-cho-2', title: 'Biệt thự gỗ óc chó 2', image: 'https://noithat102.vn/uploads/Sofa%2015.jpg', category: 'Căn Hộ' },
    { slug: 'sofa-da-bo', title: 'Sofa da bò cao cấp', image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800', category: 'Nội Thất' },
    { slug: 'ban-tra-go-oc-cho', title: 'Bàn trà gỗ óc chó', image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=800', category: 'Phòng Khách' },
  ];

  const handleAddToCart = () => {
    toast.success('Đã thêm vào giỏ hàng!'); // Hiển thị thông báo thành công

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
          <div className="mt-32 border-t border-gray-100 pt-20">
            <div className="text-center mb-12 space-y-4">
              <Badge variant="gold">GỢI Ý</Badge>

              <h2
                className="text-3xl font-bold text-teal-950 uppercase"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                SẢN PHẨM KHÁC
              </h2>

              <div className="w-20 h-1 bg-showcase-primary mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
              {products.map((product, i) => (
                <ProductCard key={i} basePath="/san-pham" {...product} />
              ))}
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
};

export default ProductDetailPage;