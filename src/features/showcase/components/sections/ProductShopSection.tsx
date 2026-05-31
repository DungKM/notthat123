import React from 'react';
import Container from '../ui/Container';
import Badge from '../ui/Badge';
import { Link } from 'react-router-dom';
import logoGiaoHang from '@/src/statics/logo_giao_hang.png';
import { useTranslation } from 'react-i18next';

interface ShopProduct {
  id: number;
  slug: string;
  nameKey: string;
  priceKey: string;
  image: string;
  rating: number;
  discount?: number;
}

const SAMPLE_PRODUCTS: ShopProduct[] = [
  {
    id: 1,
    slug: 'giuong-ngu-hien-dai-cao-cap-go-soi-ghs-9431',
    nameKey: 'product_shop.products.bed_9431',
    priceKey: 'product_shop.prices.bed_9431',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=600',
    rating: 0,
  },
  {
    id: 2,
    slug: 'tu-quan-ao-cho-be-go-soi-hien-dai-ghs-55139',
    nameKey: 'product_shop.products.wardrobe_kids_55139',
    priceKey: 'product_shop.prices.wardrobe_kids_55139',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600',
    rating: 0,
  },
  {
    id: 3,
    slug: 'tu-quan-ao-cua-lua-go-soi-hien-dai-ghs-55138',
    nameKey: 'product_shop.products.sliding_wardrobe_55138',
    priceKey: 'product_shop.prices.sliding_wardrobe_55138',
    image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&q=80&w=600',
    rating: 0,
    discount: 16,
  },
  {
    id: 4,
    slug: 'giuong-ngu-boc-nem-go-soi-hien-dai-ghs-9430',
    nameKey: 'product_shop.products.upholstered_bed_9430',
    priceKey: 'product_shop.prices.upholstered_bed_9430',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600',
    rating: 0,
  },
  {
    id: 5,
    slug: 'tu-quan-ao-cua-lua-go-soi-tu-nhien-ghs-55137',
    nameKey: 'product_shop.products.natural_sliding_wardrobe_55137',
    priceKey: 'product_shop.prices.natural_sliding_wardrobe_55137',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600',
    rating: 5,
  },
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5 mt-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={star <= rating ? '#f59e0b' : 'none'}
        stroke={star <= rating ? '#f59e0b' : '#d1d5db'}
        strokeWidth={1.5}
        className="w-3.5 h-3.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
    ))}
  </div>
);

const ProductShopCard: React.FC<{ product: ShopProduct }> = ({ product }) => {
  const { t } = useTranslation();
  const productName = t(product.nameKey);

  return (
    <Link
      to={`/san-pham/${product.slug}`}
      className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50">
        {product.discount && (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
            -{product.discount}%
          </span>
        )}
        <img
          src={product.image}
          alt={productName}
          className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1">
        <h3 className="text-sm text-gray-800 font-medium leading-snug line-clamp-2 min-h-[2.5rem]">
          {productName}
        </h3>
        <StarRating rating={product.rating} />
        <p className="text-[#a0522d] font-bold text-base mt-1">{t(product.priceKey)}</p>
      </div>

      {/* Delivery button */}
      <div className="px-3 pb-3">
        <div className="w-full overflow-hidden rounded-lg">
          <img
            src={logoGiaoHang}
            alt={t('product_detail.delivery_alt')}
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </Link>
  );
};

const ProductShopSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-gray-50">
      <Container>
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <Badge variant="gold">{t('product_shop.badge')}</Badge>
          <h2 className="text-3xl font-bold text-teal-950" style={{ fontFamily: "'Inter', sans-serif" }}>
            {t('product_shop.title')}
          </h2>
          <div className="w-20 h-1 bg-[#a0522d] mx-auto" />
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            {t('product_shop.description')}
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {SAMPLE_PRODUCTS.map((product) => (
            <ProductShopCard key={product.id} product={product} />
          ))}
        </div>

        {/* View all */}
        <div className="text-center mt-10">
          <Link
            to="/san-pham"
            className="inline-block border border-[#a0522d] text-[#a0522d] hover:bg-[#a0522d] hover:text-white transition-colors duration-300 px-8 py-2.5 rounded text-sm font-semibold tracking-wide uppercase"
          >
            {t('product_shop.view_all')}
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default ProductShopSection;
