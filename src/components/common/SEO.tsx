import React, { useEffect } from 'react';

const SITE_NAME = 'Nội Thất Hochi';
const SITE_URL = 'https://www.noithathochi.vn';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const DEFAULT_DESCRIPTION =
  'Nội Thất Hochi - Xưởng sản xuất và thi công nội thất gỗ cao cấp tại Hà Nội. Thiết kế theo yêu cầu, giao lắp miễn phí. Hotline: 0326 908 884.';
const DEFAULT_KEYWORDS =
  'nội thất hochi, nội thất gỗ, thiết kế nội thất, thi công nội thất, phòng ngủ, phòng khách, tủ bếp, giường ngủ, nội thất hà nội, gỗ óc chó, gỗ MDF';

export interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile';
  structuredData?: object | object[];
  productData?: {
    price?: number;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    brand?: string;
    sku?: string;
    image?: string;
  };
  articleData?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
  };
  noIndex?: boolean;
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqData?: Array<{ question: string; answer: string }>;
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
  faqData,
}) => {
  useEffect(() => {
    const fullTitle = title === 'Trang chủ'
      ? `${SITE_NAME} - Xưởng Sản Xuất Nội Thất Gỗ Cao Cấp`
      : `${title} | ${SITE_NAME}`;
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
    setMeta('meta[name="robots"]', 'content', noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMeta('meta[name="geo.region"]', 'content', 'VN-HN');
    setMeta('meta[name="geo.placename"]', 'content', 'Hà Nội');
    setMeta('meta[name="format-detection"]', 'content', 'telephone=yes');

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
    setMeta('meta[name="twitter:site"]', 'content', '@notthathochi');

    // ── Article Meta ────────────────────────────────────────────────────────
    if (articleData) {
      if (articleData.publishedTime) setMeta('meta[property="article:published_time"]', 'content', articleData.publishedTime);
      if (articleData.modifiedTime) setMeta('meta[property="article:modified_time"]', 'content', articleData.modifiedTime);
      if (articleData.author) setMeta('meta[property="article:author"]', 'content', articleData.author);
      if (articleData.section) setMeta('meta[property="article:section"]', 'content', articleData.section);
    }

    // ── Schema: WebSite (Sitelinks Searchbox) ───────────────────────────────
    addJsonLd('ld-website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/tim-kiem?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    });

    // ── Schema: Organization / LocalBusiness ────────────────────────────────
    addJsonLd('ld-organization', {
      '@context': 'https://schema.org',
      '@type': 'HomeAndConstructionBusiness',
      '@id': `${SITE_URL}/#organization`,
      name: 'Nội Thất Hochi',
      alternateName: 'Hochi Furniture',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/assets/images/image-logo.png`,
        width: 200,
        height: 60,
      },
      image: ogImg,
      description: 'Xưởng sản xuất và thi công nội thất gỗ cao cấp tại Hà Nội. Thiết kế theo yêu cầu, giao lắp miễn phí nội thành.',
      telephone: '+84326908884',
      email: 'hotro@noithathochi.vn',
      priceRange: '$$',
      currenciesAccepted: 'VND',
      paymentAccepted: 'Cash, Bank Transfer',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Hà Nội',
        addressLocality: 'Hà Nội',
        addressRegion: 'Hà Nội',
        postalCode: '100000',
        addressCountry: 'VN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 21.0285,
        longitude: 105.8542,
      },
      hasMap: 'https://maps.google.com/?q=Nội+Thất+Hochi+Hà+Nội',
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '08:00',
        closes: '20:00',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+84326908884',
          contactType: 'customer service',
          areaServed: 'VN',
          availableLanguage: 'Vietnamese',
          hoursAvailable: {
            '@type': 'OpeningHoursSpecification',
            opens: '08:00',
            closes: '20:00',
          },
        },
      ],
      sameAs: [
        'https://www.facebook.com/notthathochi',
        'https://www.youtube.com/@notthathochi',
      ],
      foundingDate: '2014',
      numberOfEmployees: {
        '@type': 'QuantitativeValue',
        value: 50,
      },
      areaServed: {
        '@type': 'State',
        name: 'Việt Nam',
      },
    });

    // ── Schema: Product ────────────────────────────────────────────────────
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
        manufacturer: {
          '@type': 'Organization',
          name: 'Nội Thất Hochi',
        },
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
          priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          itemCondition: 'https://schema.org/NewCondition',
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'VN',
            returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
            merchantReturnDays: 7,
          },
        },
      });
    } else {
      removeScript('ld-product');
    }

    // ── Schema: FAQ ─────────────────────────────────────────────────────────
    if (faqData && faqData.length > 0) {
      addJsonLd('ld-faq', {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqData.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      });
    } else {
      removeScript('ld-faq');
    }

    // ── Schema: Custom ─────────────────────────────────────────────────────
    if (structuredData) {
      const data = Array.isArray(structuredData) ? structuredData : [structuredData];
      data.forEach((d, i) => addJsonLd(`ld-custom-${i}`, d));
    }

    // ── Schema: Breadcrumbs ────────────────────────────────────────────────
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
  }, [title, description, keywords, canonicalPath, ogImage, ogImageAlt, ogType,
    JSON.stringify(structuredData), JSON.stringify(productData), noIndex,
    JSON.stringify(breadcrumbs), JSON.stringify(faqData)]);

  return null;
};

export const SITE_URL_CONST = SITE_URL;
export default SEO;
