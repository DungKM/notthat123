import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';

interface ProductCardProps {
  slug: string;
  title: string;
  category?: string;
  image: string;
  price?: string;
  tag?: string;
  basePath?: string;
  likes?: number;
  isLiked?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  slug,
  title,
  category,
  image,
  price,
  tag,
  basePath = '/san-pham',
  likes,
  isLiked = false,
}) => {
  return (
    <Link to={`${basePath}/${slug}`} className="group block">
      <div className="relative h-55 sm:h-65 xl:h-75 overflow-hidden rounded-xl bg-white">
        {tag && <Badge variant="gold" className="absolute top-4 left-4 z-10 shadow-lg">{tag}</Badge>}
        <img
          src={image}
          alt={title}
          className="block w-full h-full object-cover object-center scale-125"
          loading="lazy"
        />

        {/* Likes badge */}
        {likes !== undefined && likes > 0 && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
            {isLiked ? (
              // Tim tô đầy
              <svg className="w-3.5 h-3.5 text-red-500 fill-red-500" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              // Tim viền rỗng
              <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
            <span className="text-[11px] font-bold text-gray-700 leading-none">{likes}</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/20 to-transparent p-6 opacity-0 group-hover:opacity-100">
          <div className="w-full bg-showcase-primary text-white py-3 rounded-md font-bold text-xs uppercase tracking-widest text-center hover:bg-white hover:text-black transition-all">
            XEM CHI TIẾT
          </div>
        </div>
      </div>
      <div className="mt-5 text-center">
        {category && <p className="text-showcase-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{category}</p>}
        <h3 className="font-bold text-gray-900 group-hover:text-showcase-primary transition-colors uppercase text-sm tracking-wide">{title}</h3>
        {price && <p className="mt-1 text-gray-500 text-xs font-medium">{price}</p>}
        <div className="mt-3 flex justify-center gap-1 opacity-20 group-hover:opacity-100">
          <span className="w-8 h-0.5 bg-teal-900"></span>
          <span className="w-2 h-0.5 bg-showcase-primary"></span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
