import React, { useEffect } from 'react';

const SITE_NAME = 'Nội Thất Hochi';
const SITE_URL = 'https://notthathochi.com'; // Thay bằng domain thực tế
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const DEFAULT_DESCRIPTION =
  'Nội Thất Hochi - Xưởng sản xuất và thi công nội thất gỗ cao cấp tại Hà Nội. Thiết kế theo yêu cầu, giao lắp miễn phí. Hotline: 0326 908 884.';
const DEFAULT_KEYWORDS =
  'nội thất hochi, nội thất gỗ, thiết kế nội thất, thi công nội thất, phòng ngủ, phòng khách, tủ bếp, giường ngủ, nội thất hà nội, gỗ óc chó, gỗ MDF';

export interface SEOProps {
  // Bắt buộc với dynamic pages
  title: string;
  // Optional - fallback về default
  description?: string;
  keywords?: string;
  // URL của trang (không có trailing slash)
  canonicalPath?: string; // VD: '/san-pham/ghe-sofa'
  // Ảnh OG (tuyệt đối URL)
  ogImage?: string;
  ogImageAlt?: string;
  // Loại page: website | article | product | profile
  ogType?: 'website' | 'article' | 'product' | 'profile';
  // Structured Data JSON-LD
  structuredData?: object | object[];
  // Product specific
  productData?: {
    price?: number;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    brand?: string;
    sku?: string;
    image?: string;
  };
  // Bài viết / blog
  articleData?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
  };
  // Tắt index khi cần (admin, checkout...)
  noIndex?: boolean;
  // Breadcrumb list cho Google
  breadcrumbs?: Array<{ name: string; url: string }>;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonicalPath,
  ogImage,
  ogImageAlt,
  ogType = 'website',
  structuredData,
  productData,
  articleData,
  noIndex = false,
  breadcrumbs,
}) => {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const metaDesc = description || DEFAULT_DESCRIPTION;
    const metaKW = keywords || DEFAULT_KEYWORDS;
    const canonical = canonicalPath ? `${SITE_URL}${canonicalPath}` : SITE_URL;
    const ogImg = ogImage || DEFAULT_OG_IMAGE;
    const ogImgAlt = ogImageAlt || title;

    // ── Document Title ──────────────────────────────────────────────────────
    document.title = fullTitle;

    // ── Helpers ─────────────────────────────────────────────────────────────
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        const [key, val] = selector.replace('meta[', '').replace(']', '').split('="');
        el.setAttribute(key, val?.slice(0, -1) ?? '');
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    const removeScript = (id: string) => {
      document.getElementById(id)?.remove();
    };

    const addJsonLd = (id: string, data: object) => {
      removeScript(id);
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    };

    // ── Basic Meta ──────────────────────────────────────────────────────────
    setMeta('meta[name="description"]', 'content', metaDesc);
    setMeta('meta[name="keywords"]', 'content', metaKW);
    setMeta('meta[name="author"]', 'content', 'Nội Thất Hochi');
    setMeta('meta[name="robots"]', 'content', noIndex ? 'noindex, nofollow' : 'index, follow');

    // ── Canonical ───────────────────────────────────────────────────────────
    setLink('canonical', canonical);

    // ── Open Graph ──────────────────────────────────────────────────────────
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', metaDesc);
    setMeta('meta[property="og:type"]', 'content', ogType);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[property="og:image"]', 'content', ogImg);
    setMeta('meta[property="og:image:alt"]', 'content', ogImgAlt);
    setMeta('meta[property="og:image:width"]', 'content', '1200');
    setMeta('meta[property="og:image:height"]', 'content', '630');
    setMeta('meta[property="og:site_name"]', 'content', SITE_NAME);
    setMeta('meta[property="og:locale"]', 'content', 'vi_VN');

    // ── Twitter Card ────────────────────────────────────────────────────────
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', metaDesc);
    setMeta('meta[name="twitter:image"]', 'content', ogImg);

    // ── Article Meta ────────────────────────────────────────────────────────
    if (articleData) {
      if (articleData.publishedTime) setMeta('meta[property="article:published_time"]', 'content', articleData.publishedTime);
      if (articleData.modifiedTime) setMeta('meta[property="article:modified_time"]', 'content', articleData.modifiedTime);
      if (articleData.author) setMeta('meta[property="article:author"]', 'content', articleData.author);
      if (articleData.section) setMeta('meta[property="article:section"]', 'content', articleData.section);
    }

    // ── Structured Data: Organization (mọi trang) ──────────────────────────
    addJsonLd('ld-organization', {
      '@context': 'https://schema.org',
      '@type': 'HomeAndConstructionBusiness',
      name: 'Nội Thất Hochi',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      image: ogImg,
      description: DEFAULT_DESCRIPTION,
      telephone: '+84326908884',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Hà Nội', // Cập nhật địa chỉ thực tế
        addressLocality: 'Hà Nội',
        addressCountry: 'VN',
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '08:00',
        closes: '20:00',
      },
      sameAs: [
        'https://www.facebook.com/notthathochi', // Cập nhật link thực tế
      ],
    });

    // ── Structured Data: Product ────────────────────────────────────────────
    if (productData) {
      addJsonLd('ld-product', {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: title,
        description: metaDesc,
        image: productData.image || ogImg,
        brand: {
          '@type': 'Brand',
          name: productData.brand || 'Nội Thất Hochi',
        },
        sku: productData.sku,
        offers: {
          '@type': 'Offer',
          priceCurrency: productData.currency || 'VND',
          price: productData.price || 0,
          availability: productData.availability
            ? `https://schema.org/${productData.availability}`
            : 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'Nội Thất Hochi',
          },
          url: canonical,
        },
      });
    } else {
      removeScript('ld-product');
    }

    // ── Structured Data: Custom ─────────────────────────────────────────────
    if (structuredData) {
      const data = Array.isArray(structuredData) ? structuredData : [structuredData];
      data.forEach((d, i) => addJsonLd(`ld-custom-${i}`, d));
    }

    // ── Structured Data: Breadcrumbs ────────────────────────────────────────
    if (breadcrumbs && breadcrumbs.length > 0) {
      addJsonLd('ld-breadcrumb', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((bc, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: bc.name,
          item: `${SITE_URL}${bc.url}`,
        })),
      });
    } else {
      removeScript('ld-breadcrumb');
    }
  }, [title, description, keywords, canonicalPath, ogImage, ogImageAlt, ogType, JSON.stringify(structuredData), JSON.stringify(productData), noIndex, JSON.stringify(breadcrumbs)]);

  return null;
};

export const SITE_URL_CONST = SITE_URL;
export default SEO;
