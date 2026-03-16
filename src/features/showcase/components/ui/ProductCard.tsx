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
}

const ProductCard: React.FC<ProductCardProps> = ({
  slug,
  title,
  category,
  image,
  price,
  tag,
  basePath = '/san-pham'
}) => {
  return (
    <Link to={`${basePath}/${slug}`} className="group block">
      <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
        {tag && <Badge variant="gold" className="absolute top-4 left-4 z-10 shadow-lg">{tag}</Badge>}
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/20 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-full bg-showcase-primary text-white py-3 rounded-md font-bold text-xs uppercase tracking-widest text-center hover:bg-white hover:text-black transition-all">
            XEM CHI TIẾT
          </div>
        </div>
      </div>
      <div className="mt-5 text-center">
        {category && <p className="text-showcase-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{category}</p>}
        <h3 className="font-bold text-gray-900 group-hover:text-showcase-primary transition-colors uppercase text-sm tracking-wide">{title}</h3>
        {price && <p className="mt-1 text-gray-500 text-xs font-medium">{price}</p>}
        <div className="mt-3 flex justify-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
          <span className="w-8 h-0.5 bg-teal-900"></span>
          <span className="w-2 h-0.5 bg-showcase-primary"></span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
