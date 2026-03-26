import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Container from '@/src/features/showcase/components/ui/Container';
import Button from '@/src/features/showcase/components/ui/Button';
import Badge from '@/src/features/showcase/components/ui/Badge';
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  ShoppingCartOutlined,
  PhoneFilled,
  CheckOutlined,
  HeartOutlined,
  HeartFilled,
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
      <div className="relative overflow-hidden bg-gray-50">
        <img src={image} alt={product.name}
          className="w-full aspect-square object-cover"
          loading="lazy" />
        {product.likeCount > 0 && (
          <div className="absolute top-0 right-4 bg-[#f43f5e] text-white px-2.5 py-1 font-bold text-[12px] flex items-center gap-1 shadow-md" style={{ borderRadius: '0 0 6px 6px' }}>
            <HeartFilled className="text-white text-[10px]" />
            <span>{product.likeCount}</span>
          </div>
        )}
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
  const { addToCart, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = React.useState(1);

  const { data: apiProduct, loading, getBySlug, list: relatedProducts, getAll: getRelated, request: productRequest } = useProductService();
  const { list: newProducts, getAll: getNewProducts } = useProductService();

  const [isLiked, setIsLiked] = React.useState(false);
  const [isLiking, setIsLiking] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(0);

  // Lấy hoặc tạo sessionId cho guest
  const getSessionId = () => {
    let sessionId = localStorage.getItem('x-session-id');
    if (!sessionId) {
      sessionId = `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('x-session-id', sessionId);
    }
    return sessionId;
  };

  React.useEffect(() => {
    if (apiProduct) {
      setIsLiked(Boolean(apiProduct.isLiked));
      setLikeCount(Number(apiProduct.likeCount || 0));
    }
  }, [apiProduct]);

  const handleLike = async () => {
    if (!apiProduct?.id || isLiking) return;
    setIsLiking(true);
    const prevLiked = isLiked;
    const prevCount = likeCount;

    setIsLiked(!prevLiked); // optimistic update
    setLikeCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await productRequest('POST', `/${apiProduct.id}/like`, undefined, {}, { 'x-session-id': getSessionId() });
      if (res?.data !== undefined) {
        const newStatus = Boolean(res.data.liked);
        setIsLiked(newStatus);
        setLikeCount(Number(res.data.likeCount ?? (prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1)));
        if (newStatus) {
          toast.success('Đã thích sản phẩm');
        } else {
          toast.success('Đã bỏ thích sản phẩm');
        }
      }
    } catch {
      setIsLiked(prevLiked); // rollback on error
      setLikeCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  };

  React.useEffect(() => {
    if (slug) {
      getBySlug(slug).then((res) => {
        // Fetch products cùng category làm gợi ý nếu có categoryId
        if (res?.categoryId?.id) {
          getRelated({ categoryId: res.categoryId.id, limit: 5 });
        } else {
          getRelated({ limit: 5 });
        }
      });
      // Gọi API lấy dữ liệu Sản Phẩm Mới (sắp xếp theo newest)
      getNewProducts({ sort: 'newest', limit: 5 });
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
    productCode: apiProduct.productCode || 'Đang cập nhật',
    description: apiProduct.description || 'Chi tiết sản phẩm nội thất cao cấp với thiết kế hiện đại, chất liệu bền bỉ và đẹp mắt. Tôn vinh Không gian sống đẳng cấp.',
    stockQuantity: apiProduct.stockQuantity || 0,
    images: apiProduct.images && apiProduct.images.length > 0
      ? apiProduct.images.map((img: any) => img.url).filter(Boolean)
      : [
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1595514535415-816bdfb607ce?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1583847268964-b28ce8f52859?auto=format&fit=crop&q=80&w=800',
      ],
    specs: [
      { label: 'Chất liệu', value: apiProduct.material || 'Đang cập nhật' },
      { label: 'Phong cách', value: apiProduct.style || 'Đang cập nhật' },
      { label: 'Tồn kho', value: apiProduct.stockQuantity ? `${apiProduct.stockQuantity} sản phẩm` : 'Đặt hàng' },
      { label: 'Bảo hành', value: apiProduct.warranty || 'Đang cập nhật' },
    ],
    imageDetails: apiProduct.images && apiProduct.images.length > 0
      ? apiProduct.images.map((img: any) => ({ url: img.url, description: img.description || '' }))
      : [],
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
      quantity: quantity,
      subtotal: product.price * quantity,
    });
    // Trigger cart drawer open
    setIsCartOpen(true);
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

          <main className="pt-22 pb-24">
            <Container className="!max-w-[1920px] !px-[18px] sm:!px-[18px] lg:!px-[18px]">
              {/* BREADCRUMB */}
              <div className="text-[13px] !text-gray-500 mb-6 font-medium">
                <Link to="/" className="hover:text-showcase-primary !text-gray-500">Home</Link>
                <span className="mx-2">/</span>
                <Link to="/san-pham" className="hover:text-showcase-primary !text-gray-500">Sản phẩm</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{product.title}</span>
              </div>

              <div className="flex flex-col xl:flex-row gap-6">
                {/* LEFT SIDEBAR - TÌM KIẾM BỘ LỌC */}
                <div className="w-full xl:w-[220px] shrink-0 hidden xl:block">
                  <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                          TÌM KIẾM
                        </h3>
                        <h2 className="text-[18px] font-black text-gray-900 uppercase leading-none tracking-tight">
                          BỘ LỌC
                        </h2>
                      </div>
                      <svg className="w-5 h-5 text-gray-300 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </div>

                    <div className="mb-6">
                      <p className="text-[12px] text-gray-400 font-bold uppercase mb-2">Từ khóa</p>
                      <div className="relative">
                        <input type="text" placeholder="Tìm kiếm sản phẩm..." className="w-full h-10 bg-gray-50 rounded-lg border border-transparent focus:bg-white focus:border-[#c49a0e] outline-none pl-9 pr-3 text-[13px] text-gray-700 transition-colors" />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    <div>
                      <p className="text-[12px] text-gray-400 font-bold uppercase mb-2">Danh mục</p>
                      <button className="w-full h-8 bg-[#cca32e] text-white text-[13px] font-bold rounded-lg flex items-center justify-center hover:bg-[#bea748] transition-colors shadow-sm">
                        Tất cả
                      </button>
                    </div>
                  </div>
                </div>

                {/* MIDDLE CONTENT */}
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
                    {/* Gallery Section */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-sm relative border border-gray-100 group">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {/* Like Badge */}
                        {likeCount > 0 && (
                          <div className="absolute top-2 right-4 bg-[#f43f5e] text-white px-3 py-1.5 font-bold text-[14px] flex items-center gap-1.5 shadow-md" style={{ borderRadius: '6px' }}>
                            <HeartFilled className="text-white text-[12px]" />
                            <span>{likeCount}</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2 sm:gap-4">
                        {product.images.slice(0, 4).map((img: string, i: number) => (
                          <div
                            key={i}
                            className="aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-gray-300 transition-all bg-gray-50 relative"
                          >
                            <img
                              src={img}
                              alt={`${product.title} ${i}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {/* Mock Play icon on the last thumbnail */}
                            {i === 3 && (
                              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                                  <div className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-white ml-0.5"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="lg:col-span-7 flex flex-col">
                      {/* Title & Category */}
                      <div className="mb-5">
                        <h1 className="text-xl sm:text-[24px] font-bold text-gray-900 leading-snug mb-3">
                          {product.title}
                        </h1>
                        <div className="text-[15px] text-gray-700 space-y-1.5">
                          <p>Mã sản phẩm: <span className="text-gray-900">{product.productCode}</span>.</p>
                          <p><strong>Xem thêm:</strong> <Link to="/san-pham" className="!text-gray-700 hover:text-showcase-primary">{product.category}</Link></p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-4 pb-4 border-b border-gray-100 flex items-center gap-4">
                        <div className="text-xl font-bold text-[#cca32e]">
                          {product.priceText}
                        </div>
                        <button
                          onClick={handleLike}
                          disabled={isLiking}
                          className={`flex items-center gap-1.5 text-2xl transition-transform active:scale-90 ${isLiked ? 'text-red-500' : 'text-gray-300 hover:text-red-400'} ${isLiking ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          title={isLiked ? 'Bỏ thích' : 'Yêu thích'}
                        >
                          {isLiked ? <HeartFilled /> : <HeartOutlined />}
                          {likeCount > 0 && <span className="text-lg font-medium tracking-tight mb-0.5">{likeCount}</span>}
                        </button>
                      </div>

                      {/* Stock Status */}
                      <div className="mb-6 flex items-center gap-2 text-[14px] font-medium">
                        <CheckCircleFilled className="!text-[#cca32e] text-[16px]" />
                        <span className="text-[#cca32e]">Tình trạng tồn kho:</span>
                        {product.stockQuantity ? (
                          <span className="text-gray-400">Còn hàng</span>
                        ) : (
                          <span className="text-gray-400">Hết hàng</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-stretch gap-3 mb-8">
                        {/* Quantity Selector */}
                        <div className="flex border border-gray-300 rounded overflow-hidden h-10 w-[64px] bg-white shrink-0">
                          <div className="flex-1 flex items-center justify-center font-bold text-gray-800 text-[14px]">
                            {quantity}
                          </div>
                          <div className="flex flex-col border-l border-gray-300 w-6">
                            <button onClick={() => setQuantity(q => q + 1)} className="flex-1 flex items-center justify-center hover:bg-gray-100 border-b border-gray-300 text-gray-600 text-[10px] pb-0.5" title="Tăng số lượng">
                              <span className="leading-none mt-1">+</span>
                            </button>
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="flex-1 flex items-center justify-center hover:bg-gray-100 text-gray-600 text-[12px] pb-0.5" title="Giảm số lượng">
                              <span className="leading-none mb-1">-</span>
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={handleAddToCart}
                          className="h-8 px-5 bg-[#cca32e] hover:bg-[#bea748] text-white font-bold rounded flex items-center gap-2 transition-colors text-[13px] tracking-wide !cursor-pointer "
                        >
                          <ShoppingCartOutlined className="text-[16px]" />
                          Thêm vào giỏ
                        </button>

                        <button
                          onClick={handleBuyNow}
                          className="h-8 px-6 bg-[#e54d42] hover:bg-[#c93f35] text-white font-bold rounded transition-colors text-[13px] tracking-wide !cursor-pointer"
                        >
                          Mua ngay
                        </button>

                        <a
                          href="tel:0911972789"
                          className="h-8 px-5 !bg-[#222] hover:bg-black !text-white font-bold rounded flex items-center gap-2 transition-colors text-[13px] tracking-wide !cursor-pointer"
                        >
                          <PhoneFilled className="text-[16px]" />
                          Gọi tư vấn
                        </a>
                      </div>

                      {/* Policy Box */}
                      <div className="border border-gray-100 rounded-lg p-5 bg-[#fafafa]">
                        <h3 className="text-[13px] font-bold text-[#8b5a2b] mb-4 uppercase tracking-wide">
                          XƯỞNG NỘI THẤT GỖ TRANG TRÍ - SINCE 2014
                        </h3>
                        <ul className="space-y-3 text-[14px] text-gray-600">
                          <li className="flex items-start gap-3">
                            <CheckOutlined className="!text-green-500 mt-1 flex-shrink-0 text-[15px]" />
                            <span className="leading-snug">Giao hàng & lắp đặt MIỄN PHÍ cho các đơn hàng &gt;2 triệu, gồm: Hà Nội, Hồ Chí Minh, Đà Nẵng, Hải Phòng, Bình Dương, Đồng Nai.</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckOutlined className="!text-green-500 mt-1 flex-shrink-0 text-[15px]" />
                            <span className="leading-snug">Thời gian giao hàng tiêu chuẩn dự kiến 1~7 ngày</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckOutlined className="!text-green-500 mt-1 flex-shrink-0 text-[15px]" />
                            <span className="leading-snug"><strong className="text-gray-800">Nhận đặt đóng đồ theo yêu cầu dù chỉ 1 món</strong> - miễn phí thiết kế 3D</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckOutlined className="!text-green-500 mt-1 flex-shrink-0 text-[15px]" />
                            <span className="leading-snug">Giá đã bao gồm hóa đơn điện tử HKD</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Related Products moved inside Middle Column */}
                  <div className="mb-16">
                    <div className="text-center mb-8">
                      <h2 className="text-[24px] font-bold text-gray-900">
                        Sản phẩm tương tự
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {(relatedProducts || []).slice(0, 4).map((rp: any, i: number) => (
                        <RelatedProductCard key={rp.id || i} product={rp} />
                      ))}
                    </div>
                  </div>

                  {/* Product Description */}
                  <div className="mt-24 w-full">
                    {/* Tab Header */}
                    <div className="flex border-b border-gray-200">
                      <div className="bg-[#2f231f] text-white px-8 py-3 font-bold text-[13px] uppercase tracking-wider">
                        MÔ TẢ
                      </div>
                    </div>

                    {/* Content Box */}
                    <div className="border border-t-0 border-gray-200 bg-white p-6 sm:p-10 mb-10">
                      <div className="prose max-w-none text-gray-900 text-[15px] leading-relaxed">
                        {/* Mô tả sản phẩm */}
                        {product.description && (
                          <p className="font-bold mb-8 text-black">
                            {product.description}
                          </p>
                        )}

                        {/* Thông số kỹ thuật */}
                        <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
                          <table className="w-full text-[14px]">
                            <tbody>
                              {product.specs.map((spec: any, i: number) => (
                                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                  <td className="px-4 py-3 font-semibold text-gray-700 w-[140px] border-r border-gray-200">{spec.label}</td>
                                  <td className="px-4 py-3 text-gray-800">{spec.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Ảnh sản phẩm kèm mô tả */}
                        {product.imageDetails && product.imageDetails.length > 0 && (
                          <div className="space-y-6">
                            {product.imageDetails.map((img: any, i: number) => (
                              <div key={i} className="flex flex-col items-center">
                                <img
                                  src={img.url}
                                  alt={img.description || product.title}
                                  className="w-full max-w-4xl mx-auto block rounded"
                                  loading="lazy"
                                />
                                {img.description && (
                                  <div className="w-full max-w-4xl bg-[#f2f2f2] py-2.5 px-4 mt-1 text-center text-[14px] italic text-black">
                                    {img.description}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div> {/* End Middle Content */}

                {/* RIGHT SIDEBAR - SẢN PHẨM MỚI */}
                <div className="w-full xl:w-[250px] shrink-0 hidden xl:block">
                  <div className="bg-[#cca32e] rounded-[30px] py-2 px-6 text-center mb-5 shadow-sm">
                    <h3 className="text-white font-black text-[12px] uppercase tracking-widest">Sản phẩm mới</h3>
                  </div>

                  <div className="flex flex-col">
                    {(newProducts || []).slice(0, 5).map((rp: any, i: number) => (
                      <Link to={`/san-pham/${rp.slug || rp.id}`} key={i} className={`flex gap-3 group bg-white py-4 ${i !== 0 ? 'border-t border-gray-100' : ''}`}>
                        <div className="w-[75px] h-[75px] shrink-0 overflow-hidden bg-gray-50 border border-transparent group-hover:border-[#c49a0e] transition-colors rounded">
                          <img
                            src={rp.images?.[0]?.url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=200'}
                            alt={rp.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="text-[13px] text-gray-800 font-medium line-clamp-2 hover:text-[#cca32e] leading-snug mb-1 transition-colors">
                            {rp.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-auto">
                            <span className="text-gray-400 line-through text-[12px]">
                              {rp.oldPrice ? `${rp.oldPrice.toLocaleString()}đ` : '700.000'}
                            </span>
                            <span className="text-gray-900 font-bold text-[14px]">
                              {(rp.price || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

              </div> {/* End Flex Layout wrapper */}
            </Container>
          </main>
        </>
      )}
    </div>
  );
};

export default ProductDetailPage;