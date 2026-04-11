import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ROUTES } from '../../../../routes';
import {
  ShoppingCartOutlined,
  MenuOutlined,
  CloseOutlined,
  GlobalOutlined,
  DownOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  SearchOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import Container from '../ui/Container';
import { useCart } from '../../context/CartContext';
import { useTranslation } from 'react-i18next';
import { useConstructionCategoryService, useCategoryService } from '@/src/api/services';
import { useApi } from '@/src/hooks/useApi';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const location = useLocation();
  const navigate = useNavigate();
  const [showTopBar, setShowTopBar] = useState(true);
  const [activeMegaCategory, setActiveMegaCategory] = useState<any>(null);
  const [activeMegaProjectCategory, setActiveMegaProjectCategory] = useState<any>(null);
  const [megaMenuForceHide, setMegaMenuForceHide] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState<string | null>(null);
  const megaMenuCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cartRef = useRef<HTMLDivElement | null>(null);
  const cartButtonRef = useRef<HTMLDivElement | null>(null);
  const cartDrawerRef = useRef<HTMLDivElement | null>(null);
  const { cartItems, cartCount, totalAmount, updateQuantity, removeFromCart, isCartOpen, setIsCartOpen } = useCart();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [tempQuantities, setTempQuantities] = useState<Record<string, string>>({});
  const [minQtyWarnings, setMinQtyWarnings] = useState<Record<string, boolean>>({});
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

  // ─── Search ───
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ products: any[]; constructions: any[] }>({ products: [], constructions: [] });
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const { request: searchRequest } = useApi<any>('/search');

  // ─── Danh mục công trình ───
  const { getAll: getCongTrinhCategories } = useConstructionCategoryService();
  const [congTrinhCategories, setCongTrinhCategories] = React.useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('HOCHI_CONG_TRINH_CATS');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });

  // ─── Danh mục sản phẩm ───
  const { getAll: getProductCategories } = useCategoryService();
  const [productCategories, setProductCategories] = React.useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('HOCHI_PRODUCT_CATS');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });

  React.useEffect(() => {
    getCongTrinhCategories({ limit: 20 })
      .then((res) => {
        const data = res || [];
        setCongTrinhCategories(data);
        localStorage.setItem('HOCHI_CONG_TRINH_CATS', JSON.stringify(data));
      })
      .catch(() => { });

    getProductCategories({ limit: 50 })
      .then((res) => {
        const data = res || [];
        setProductCategories(data);
        localStorage.setItem('HOCHI_PRODUCT_CATS', JSON.stringify(data));
      })
      .catch(() => { });
  }, []);

  const currentLang = i18n.language?.toUpperCase().substring(0, 2) || 'VI';

  // ─── Debounced Search ───
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ products: [], constructions: [] });
      setShowResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchRequest('GET', '', null, { keyword: searchQuery.trim(), limit: 8 });
        const data = res?.data || {};
        setSearchResults({
          products: Array.isArray(data.products) ? data.products : [],
          constructions: Array.isArray(data.constructions) ? data.constructions : [],
        });
        setShowResults(true);
      } catch {
        setSearchResults({ products: [], constructions: [] });
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const totalSearchResults = searchResults.products.length + searchResults.constructions.length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ngăn chặn cuộn body khi giỏ hàng đang mở
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Close cart when clicking outside (Desktop only, mobile uses full screen overlay)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 1024) return;

      const target = event.target as Node;

      const clickedButton =
        cartButtonRef.current && cartButtonRef.current.contains(target);

      const clickedDrawer =
        cartDrawerRef.current && cartDrawerRef.current.contains(target);

      if (!clickedButton && !clickedDrawer) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' }
  ];

  const navLinks = [
    {
      title: t('nav.about'),
      href: ROUTES.TRANG_CHU,
      submenu: [
        { title: t('nav.about_us'), href: ROUTES.GIOI_THIEU },
        { title: t('nav.why_choose_us'), href: ROUTES.VI_SAO_CHON_CHUNG_TOI }
      ]
    },
    {
      title: t('nav.products'),
      href: ROUTES.SAN_PHAM,

    },
    {
      title: t('nav.projects'),
      href: ROUTES.CONG_TRINH,

    },
    { title: t('nav.partners'), href: ROUTES.DOI_TAC },
    { title: t('nav.videos'), href: ROUTES.VIDEO },
    { title: t('nav.contact'), href: ROUTES.LIEN_HE },
    { title: t('nav.recruitment'), href: ROUTES.TUYEN_DUNG },
    { title: t('nav.internal'), href: ROUTES.DANG_NHAP, target: '_blank' }
  ];

  const isDetailLikePage =
    location.pathname.startsWith('/san-pham/') ||
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/cong-trinh/') ||
    location.pathname.startsWith('/doi-tac/');

  const isDarkHeader = isScrolled || isDetailLikePage;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isDarkHeader ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'
          }`}
      >
        <Container className="flex items-center justify-between xl:!max-w-[1400px]">
          {/* Logo */}
          <Link to="/" className="relative z-50 transition-transform hover:scale-105 mr-4 lg:mr-6 xl:mr-4 2xl:mr-8">
            <div className="w-[100px] sm:w-[120px]">
              <img
                src="/assets/images/image-logo.png"
                alt="Nội Thất Hochi"
                className={`w-full h-auto object-contain transition-all duration-300 ${!isDarkHeader ? 'brightness-0 invert' : ''}`}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center xl:gap-x-3 2xl:gap-x-5">
            {navLinks.map((link) => (
              <div
                key={link.title}
                className={`${link.href === ROUTES.SAN_PHAM || link.href === ROUTES.CONG_TRINH ? 'static' : 'relative'} group`}
                onMouseEnter={() => {
                  if (link.href === ROUTES.SAN_PHAM || link.href === ROUTES.CONG_TRINH) {
                    // Clear any pending close
                    if (megaMenuCloseTimer.current) clearTimeout(megaMenuCloseTimer.current);
                    if (!megaMenuForceHide) setMegaMenuOpen(link.href);
                  }
                }}
                onMouseLeave={(e) => {
                  setMegaMenuForceHide(false);
                  if (link.href === ROUTES.SAN_PHAM || link.href === ROUTES.CONG_TRINH) {
                    // Delay close so cursor can move from nav item to panel
                    megaMenuCloseTimer.current = setTimeout(() => setMegaMenuOpen(null), 300);
                  }
                }}
              >
                <Link
                  to={link.href}
                  target={link.target}
                  className={`text-[12px] 2xl:text-[13px] font-bold uppercase tracking-wide whitespace-nowrap transition-all duration-300 hover:text-showcase-primary flex items-center gap-1 ${isDarkHeader ? '!text-gray-800' : '!text-white'
                    }`}
                >
                  {link.title}
                  {link.submenu && <DownOutlined className="text-[8px] transition-transform group-hover:rotate-180" />}
                  {link.href === ROUTES.CONG_TRINH && congTrinhCategories.length > 0 && <DownOutlined className="text-[8px] transition-transform group-hover:rotate-180" />}
                  {link.href === ROUTES.SAN_PHAM && productCategories.length > 0 && <DownOutlined className="text-[8px] transition-transform group-hover:rotate-180" />}
                </Link>

                {link.submenu && (
                  <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="bg-[#f4f7f9] overflow-hidden border border-[#e5e9f0]" style={{ minWidth: 240 }}>
                      {link.submenu.map((sub) => (
                        <a
                          key={sub.title}
                          href={sub.href}
                          className="flex items-center justify-between px-6 py-3.5 text-[14px] font-bold border-b border-[#e5e9f0] last:border-0 transition-all duration-200"
                          style={{ color: '#1f2937' }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#C5A059';
                            (e.currentTarget as HTMLAnchorElement).style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
                            (e.currentTarget as HTMLAnchorElement).style.color = '#1f2937';
                          }}
                        >
                          <span>{sub.title}</span>
                          <ArrowRightOutlined className="text-[10px] transition-all duration-200" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submenu Sản Phẩm - MEGA MENU */}
                {link.href === ROUTES.SAN_PHAM && productCategories.length > 0 && (
                  <div
                    className={`absolute top-full pt-4 left-0 right-0 z-20 pointer-events-none transition-all duration-300 ${(megaMenuOpen === ROUTES.SAN_PHAM && !megaMenuForceHide) ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-3'}`}
                  >
                    <div
                      className="mx-auto w-full max-w-[1240px] px-4 xl:px-4 pointer-events-auto"
                      onMouseEnter={() => {
                        if (megaMenuCloseTimer.current) clearTimeout(megaMenuCloseTimer.current);
                      }}
                      onMouseLeave={() => {
                        megaMenuCloseTimer.current = setTimeout(() => setMegaMenuOpen(null), 300);
                      }}
                    >
                      <div
                        className="bg-white rounded-b-xl overflow-hidden flex min-h-[450px] border border-gray-100 relative"
                        onMouseLeave={() => setActiveMegaCategory(null)}
                      >
                        {/* Left Sidebar - Parent Categories */}
                        <div className="w-[200px] bg-[#f4f7f9] flex flex-col py-4 shrink-0 border-r border-[#e5e9f0]">
                          {productCategories.map((cat: any, index: number) => {
                            const isActive = activeMegaCategory ? activeMegaCategory.id === cat.id : index === 0;
                            return (
                              <div
                                key={cat.id || cat._id}
                                onMouseEnter={() => setActiveMegaCategory(cat)}
                                onClick={() => { setMegaMenuForceHide(true); setMegaMenuOpen(null); navigate(`${ROUTES.DANH_SACH_SAN_PHAM}?category=${cat.slug || cat.id || cat._id}`); }}
                                className={`flex items-center px-6 py-3.5 cursor-pointer transition-all duration-300 relative border-b ${isActive ? 'bg-showcase-primary text-white border-showcase-primary' : 'text-gray-700 border-[#e5e9f0] hover:bg-[#ebf0f5]'
                                  }`}
                              >
                                <span className={`font-bold text-[14px] flex-1 text-left transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-800'}`}>
                                  {cat.name}
                                </span>
                                {/* Right Arrow Triangle */}
                                <div className={`absolute top-1/2 -right-0 -translate-y-1/2 w-0 h-0 border-y-[10px] border-y-transparent border-l-[12px] border-l-showcase-primary translate-x-[11px] z-10 pointer-events-none transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                              </div>
                            );
                          })}
                        </div>

                        {/* Right Area - Child Categories */}
                        <div className="flex-1 bg-[#fbfcfd] p-8 overflow-y-auto">
                          {(() => {
                            const currentCat = activeMegaCategory || productCategories[0];
                            if (!currentCat || !currentCat.children || currentCat.children.length === 0) {
                              return <div className="text-gray-400 italic text-[14px]">Không có danh mục con</div>;
                            }
                            return (
                              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
                                {currentCat.children.map((child: any) => (
                                    <a
                                      key={child.id || child._id}
                                      href={`${ROUTES.DANH_SACH_SAN_PHAM}?search=${child.slug}`}
                                      className="flex items-center gap-3 px-2 border border-gray-200 rounded-lg hover:border-showcase-primary group/sub bg-white"
                                      onClick={() => { setMegaMenuForceHide(true); setMegaMenuOpen(null); }}
                                    >
                                    <span className="flex-1 font-bold text-[13px] text-gray-700 group-hover/sub:text-showcase-primary whitespace-nowrap min-w-0 ">
                                      {child.name}
                                    </span>
                                    <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                      {child.representativeImage ? (
                                        <img src={child.representativeImage || child.image} alt={child.name} className="w-full h-full object-contain mix-blend-multiply" />
                                      ) : (
                                        <img src="/assets/images/image-logo.png" className="w-10 h-8 object-contain" alt="" />
                                      )}
                                    </div>
                                  </a>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submenu Công Trình - MEGA MENU */}
                {link.href === ROUTES.CONG_TRINH && congTrinhCategories.length > 0 && (
                  <div
                    className={`absolute top-full pt-4 left-0 right-0 z-20 pointer-events-none transition-all duration-300 ${(megaMenuOpen === ROUTES.CONG_TRINH && !megaMenuForceHide) ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-3'}`}
                  >
                    <div
                      className="mx-auto w-full max-w-[1240px] px-4 xl:px-4 pointer-events-auto"
                      onMouseEnter={() => {
                        if (megaMenuCloseTimer.current) clearTimeout(megaMenuCloseTimer.current);
                      }}
                      onMouseLeave={() => {
                        megaMenuCloseTimer.current = setTimeout(() => setMegaMenuOpen(null), 300);
                      }}
                    >
                      <div
                        className="bg-white rounded-b-xl overflow-hidden flex min-h-[450px] border border-gray-100 relative"
                        onMouseLeave={() => setActiveMegaProjectCategory(null)}
                      >
                        {/* Left Sidebar - Parent Categories */}
                        <div className="w-[200px] bg-[#f4f7f9] flex flex-col py-4 shrink-0 border-r border-[#e5e9f0]">
                          {congTrinhCategories.map((cat: any, index: number) => {
                            const isActive = activeMegaProjectCategory ? activeMegaProjectCategory.id === cat.id : index === 0;
                            return (
                              <div
                                key={cat.id || cat._id}
                                onMouseEnter={() => setActiveMegaProjectCategory(cat)}
                                onClick={() => { setMegaMenuForceHide(true); setMegaMenuOpen(null); navigate(`${ROUTES.CONG_TRINH}?category=${cat.slug || cat.id || cat._id}`); }}
                                className={`flex items-center px-6 py-3.5 cursor-pointer transition-all duration-300 relative border-b ${isActive ? 'bg-showcase-primary text-white border-showcase-primary' : 'text-gray-700 border-[#e5e9f0] hover:bg-[#ebf0f5]'
                                  }`}
                              >
                                <span className={`font-bold text-[14px] flex-1 text-left transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-800'}`}>
                                  {cat.name}
                                </span>
                                {/* Right Arrow Triangle */}
                                <div className={`absolute top-1/2 -right-0 -translate-y-1/2 w-0 h-0 border-y-[10px] border-y-transparent border-l-[12px] border-l-showcase-primary translate-x-[11px] z-10 pointer-events-none transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                              </div>
                            );
                          })}
                        </div>

                        {/* Right Area - Child Categories */}
                        <div className="flex-1 bg-[#fbfcfd] p-8 overflow-y-auto">
                          {(() => {
                            const currentCat = activeMegaProjectCategory || congTrinhCategories[0];
                            if (!currentCat || !currentCat.children || currentCat.children.length === 0) {
                              return (
                                <div>
                                  <div className="text-gray-400 italic text-[14px]">Không có danh mục con</div>
                                  <div className="mt-4">
                                    <a
                                      href={`${ROUTES.CONG_TRINH}?category=${currentCat.slug || currentCat.id || currentCat._id}`}
                                      className="inline-flex items-center gap-2 text-[13px] font-bold text-showcase-primary hover:underline hover:text-[#C5A059]"
                                      onClick={() => { setMegaMenuForceHide(true); setMegaMenuOpen(null); }}
                                    >
                                      Xem tất cả công trình {currentCat.name}
                                      <ArrowRightOutlined className="text-[10px]" />
                                    </a>
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
                                {currentCat.children.map((child: any) => (
                                  <a
                                    key={child.id || child._id}
                                    href={`${ROUTES.CONG_TRINH}?category=${child.slug}`}
                                    className="flex items-center gap-3 px-2 py-2 border border-gray-200 rounded-lg hover:border-showcase-primary group/sub bg-white"
                                    onClick={() => { setMegaMenuForceHide(true); setMegaMenuOpen(null); }}
                                  >
                                    <span className="flex-1 font-bold text-[13px] text-gray-700 group-hover/sub:text-showcase-primary whitespace-nowrap min-w-0 ">
                                      {child.name}
                                    </span>
                                    <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center overflow-hidden rounded">
                                      {child.representativeImage || child.image ? (
                                        <img src={child.representativeImage || child.image} alt={child.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <img src="/assets/images/image-logo.png" className="w-10 h-8 object-contain mix-blend-multiply" alt="" />
                                      )}
                                    </div>
                                  </a>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 2xl:gap-4 ml-4 lg:ml-6 xl:ml-4 2xl:ml-8">
            {/* Search Bar - Desktop */}
            <div ref={searchRef} className="relative hidden md:flex">
              <div className={`flex items-center bg-white rounded-full px-4 py-2 border transition-all  ${isDarkHeader ? 'border-gray-200' : 'border-white/20 border-gray-800'}`}>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (totalSearchResults > 0) setShowResults(true); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      setShowResults(false);
                      navigate(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  className="bg-transparent outline-none text-[13px] w-[14vw] xl:w-[10vw] 2xl:w-[15vw] min-w-[100px] max-w-[250px] transition-all duration-300 focus:w-[20vw] text-gray-800 placeholder-gray-400"
                />
                <div className="ml-2 w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {isSearching ? (
                    <LoadingOutlined className="text-gray-400 text-base" />
                  ) : (
                    <SearchOutlined
                      onClick={() => {
                        if (searchQuery.trim()) {
                          setShowResults(false);
                          navigate(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
                        }
                      }}
                      className="text-gray-400 text-base hover:text-showcase-primary cursor-pointer transition-colors"
                    />
                  )}
                </div>
              </div>
              {/* Dropdown: has results */}
              {showResults && totalSearchResults > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden min-w-[360px]">
                  <div className="max-h-[420px] overflow-y-auto">

                    {/* Group: Sản phẩm */}
                    {searchResults.products.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sản phẩm</span>
                          <span className="text-[10px] font-bold text-showcase-primary bg-amber-50 px-1.5 py-0.5 rounded-full">{searchResults.products.length}</span>
                        </div>
                        {searchResults.products.map((item: any) => (
                          <button
                            key={item.id || item._id}
                            type="button"
                            onClick={() => {
                              setShowResults(false);
                              setSearchQuery('');
                              navigate(`/san-pham/${item.slug}`);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 hover:bg-amber-50 text-left transition-colors group/item"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                              {item.image
                                ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                : <img src="/assets/images/image-logo.png" className="w-full h-full object-contain p-1" alt="" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-gray-800 font-semibold truncate group-hover/item:text-showcase-primary transition-colors">{item.name}</p>
                            </div>
                            <ArrowRightOutlined className="text-[10px] text-gray-300 group-hover/item:text-showcase-primary group-hover/item:translate-x-0.5 transition-all flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Divider nếu có cả 2 nhóm */}
                    {searchResults.products.length > 0 && searchResults.constructions.length > 0 && (
                      <div className="border-t border-gray-100 mx-4" />
                    )}

                    {/* Group: Công trình */}
                    {searchResults.constructions.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Công trình</span>
                          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">{searchResults.constructions.length}</span>
                        </div>
                        {searchResults.constructions.map((item: any) => (
                          <button
                            key={item.id || item._id}
                            type="button"
                            onClick={() => {
                              setShowResults(false);
                              setSearchQuery('');
                              navigate(`/cong-trinh/${item.slug}`);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 hover:bg-blue-50 text-left transition-colors group/item"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                              {item.image
                                ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                : <img src="/assets/images/image-logo.png" className="w-full h-full object-contain p-1" alt="" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-gray-800 font-semibold truncate group-hover/item:text-blue-600 transition-colors">{item.name}</p>
                            </div>
                            <ArrowRightOutlined className="text-[10px] text-gray-300 group-hover/item:text-blue-500 group-hover/item:translate-x-0.5 transition-all flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}

                  </div>

                  {/* Footer: Xem tất cả */}
                  <div className="border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResults(false);
                        navigate(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
                      }}
                      className="w-full flex items-center justify-center gap-2 text-[12px] font-bold text-showcase-primary py-3 hover:bg-amber-50 transition-colors"
                    >
                      Xem tất cả {totalSearchResults} kết quả
                      <ArrowRightOutlined className="text-[10px]" />
                    </button>
                  </div>
                </div>
              )}

              {/* Dropdown: empty state - searched but no results */}
              {showResults && !isSearching && searchQuery.trim() && totalSearchResults === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden min-w-[320px]">
                  <div className="px-5 py-6 text-center">
                    <SearchOutlined className="text-2xl text-gray-300 mb-2" />
                    <p className="text-[13px] font-semibold text-gray-600">Không tìm thấy kết quả</p>
                    <p className="text-[11px] text-gray-400 mt-1">Thử từ khóa khác hoặc xem toàn bộ</p>
                  </div>
                  <div className="border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResults(false);
                        navigate(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
                      }}
                      className="w-full flex items-center justify-center gap-2 text-[12px] font-bold text-gray-500 py-3 hover:bg-gray-50 transition-colors"
                    >
                      Trang kết quả tìm kiếm
                      <ArrowRightOutlined className="text-[10px]" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher - Desktop */}
            <div className="hidden lg:block relative group">
              <button
                className={`flex items-center gap-1.5 text-[12px] font-black tracking-tighter uppercase px-3 py-1.5 rounded-full border transition-all ${isDarkHeader
                  ? 'text-gray-700 border-gray-200 hover:bg-gray-50'
                  : 'text-white border-white/20 hover:bg-white/10'
                  }`}
              >
                <GlobalOutlined className="text-sm" />
                {currentLang}
                <DownOutlined className="text-[8px]" />
              </button>

              <div className="absolute right-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="bg-white py-2 min-w-[180px] border border-gray-100 overflow-hidden">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => i18n.changeLanguage(lang.code)}
                      className="flex items-center justify-between w-full px-5 py-3 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg">{lang.flag}</span>
                        <span className={i18n.language === lang.code ? 'font-bold text-showcase-primary' : 'text-gray-600'}>
                          {lang.label}
                        </span>
                      </span>
                      {i18n.language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-showcase-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Search Button */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setMobileSearchOpen(true)}
                className={`group flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-300 ${isDarkHeader
                  ? 'text-gray-800 border-gray-200 hover:bg-gray-50'
                  : 'text-white border-white/30 hover:bg-white/10'
                  }`}
              >
                <SearchOutlined className="text-lg group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Mobile Search Overlay */}
            {mobileSearchOpen && (
              <div className="fixed inset-0 z-[200] flex flex-col md:hidden" style={{ background: 'rgba(0,0,0,0.7)' }}>
                {/* Header of overlay */}
                <div className="bg-white px-4 py-3 flex items-center gap-3 shadow-md">
                  <SearchOutlined className="text-gray-400 text-lg flex-shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Tìm kiếm sản phẩm, công trình..."
                    value={mobileSearchQuery}
                    onChange={e => setMobileSearchQuery(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && mobileSearchQuery.trim()) {
                        setMobileSearchOpen(false);
                        setMobileSearchQuery('');
                        navigate(`/tim-kiem?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
                      }
                    }}
                    className="flex-1 outline-none text-gray-800 text-base placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => { setMobileSearchOpen(false); setMobileSearchQuery(''); }}
                    className="text-gray-400 hover:text-gray-700 transition-colors p-1"
                  >
                    <CloseOutlined className="text-lg" />
                  </button>
                </div>
                {/* Nút tìm */}
                {mobileSearchQuery.trim() && (
                  <div className="bg-white border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileSearchOpen(false);
                        navigate(`/tim-kiem?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
                        setMobileSearchQuery('');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 text-left transition-colors"
                    >
                      <SearchOutlined className="text-showcase-primary" />
                      <span className="text-sm text-gray-700">Tìm kiếm <span className="font-bold text-gray-900">"{mobileSearchQuery}"</span></span>
                      <ArrowRightOutlined className="text-[11px] text-gray-400 ml-auto" />
                    </button>
                  </div>
                )}
                {/* Backdrop click to close */}
                <div className="flex-1" onClick={() => { setMobileSearchOpen(false); setMobileSearchQuery(''); }} />
              </div>
            )}

            {/* Cart Button */}
            <div className="relative" ref={cartButtonRef}>
              <button
                type="button"
                onClick={() => setIsCartOpen(!isCartOpen)}
                className={`group flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${isDarkHeader
                  ? 'text-gray-800 border-gray-200 hover:bg-gray-50'
                  : 'text-white border-white/30 hover:bg-white/10'
                  }`}
              >
                <div className="relative flex items-center">
                  <ShoppingCartOutlined className="text-xl group-hover:scale-110 transition-transform" />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2.5 -right-3.5 bg-yellow-700 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span className="font-bold uppercase text-[12px] tracking-wider hidden xl:block whitespace-nowrap">Giỏ hàng</span>
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className={`xl:hidden flex items-center justify-center w-10 h-10 rounded-full transition-all ${isDarkHeader ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
              onClick={() => setIsMenuOpen(true)}
            >
              <MenuOutlined className="text-xl" />
            </button>
          </div>
        </Container>
      </header>

      {/* Cart Drawer - Improved for Mobile & Desktop */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              ref={cartDrawerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-stone-100">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t('cart.title')}</h2>
                  <p className="text-sm text-gray-500 mt-1">{t('cart.item_count', { count: cartCount })}</p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <CloseOutlined className="text-lg" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                      <ShoppingCartOutlined className="text-4xl text-gray-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{t('cart.empty_title')}</h3>
                      <p className="text-gray-500 text-sm mt-1">{t('cart.empty_desc')}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/san-pham');
                      }}
                      className="px-8 py-3 bg-showcase-primary text-white rounded-full font-bold hover:opacity-90 transition-opacity"
                    >
                      {t('cart.continue_shopping')}
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 group mb-4 border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                      <div className="relative w-[100px] h-[130px] rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h4 className="text-[15px] font-medium !text-gray-900 line-clamp-2 leading-snug">{item.title}</h4>

                        <div className="mt-3">
                          <div className={`flex shrink-0 items-center rounded-full overflow-hidden h-9 w-[100px] bg-white border ${item.stockQuantity !== undefined && item.quantity >= item.stockQuantity ? 'border-red-400' : 'border-gray-200'}`}>
                            <button
                              onClick={() => {
                                if (item.quantity <= 1) {
                                  setMinQtyWarnings(prev => ({ ...prev, [item.id]: true }));
                                  setTimeout(() => setMinQtyWarnings(prev => ({ ...prev, [item.id]: false })), 3000);
                                  return;
                                }
                                setMinQtyWarnings(prev => ({ ...prev, [item.id]: false }));
                                updateQuantity(item.id, item.quantity - 1);
                              }}
                              className="flex-1 h-full flex items-center justify-center text-slate-800 hover:bg-slate-100 transition-colors text-xl font-light pb-0.5"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              value={tempQuantities[item.id] !== undefined ? tempQuantities[item.id] : (item.quantity || '')}
                              onChange={(e) => {
                                let val = e.target.value;

                                if (val !== '') {
                                  let numVal = parseInt(val);
                                  if (!isNaN(numVal)) {
                                    if (numVal > 999) numVal = 999;
                                    if (item.stockQuantity !== undefined && numVal > item.stockQuantity) {
                                      numVal = item.stockQuantity;
                                    }
                                    val = numVal.toString();
                                    if (numVal >= 1) updateQuantity(item.id, numVal);
                                  }
                                }
                                setTempQuantities(prev => ({ ...prev, [item.id]: val }));
                              }}
                              onBlur={(e) => {
                                let numVal = parseInt(e.target.value);
                                if (isNaN(numVal) || numVal < 1) {
                                  updateQuantity(item.id, 1);
                                  setMinQtyWarnings(prev => ({ ...prev, [item.id]: true }));
                                  setTimeout(() => setMinQtyWarnings(prev => ({ ...prev, [item.id]: false })), 3000);
                                } else {
                                  setMinQtyWarnings(prev => ({ ...prev, [item.id]: false }));
                                  if (item.stockQuantity !== undefined && numVal > item.stockQuantity) {
                                    updateQuantity(item.id, item.stockQuantity);
                                  }
                                }
                                setTempQuantities(prev => {
                                  const next = { ...prev };
                                  delete next[item.id];
                                  return next;
                                });
                              }}
                              className="flex-[1.5] w-full text-center text-[13px] font-semibold text-slate-900 focus:outline-none focus:bg-gray-50 h-full border-x border-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              onClick={() => {
                                if (item.stockQuantity !== undefined && item.quantity >= item.stockQuantity) return;
                                updateQuantity(item.id, item.quantity + 1);
                              }}
                              className={`flex-1 h-full flex items-center justify-center transition-colors text-xl font-light pb-0.5 ${item.stockQuantity !== undefined && item.quantity >= item.stockQuantity ? 'text-slate-300 bg-slate-50 cursor-not-allowed' : 'text-slate-800 hover:bg-slate-100'}`}
                            >
                              +
                            </button>
                          </div>

                          {minQtyWarnings[item.id] && (
                            <p className="mt-1.5 text-[11px] text-amber-600 font-medium">Số lượng đặt hàng tối thiểu 1</p>
                          )}
                          {item.stockQuantity !== undefined && item.quantity >= item.stockQuantity && (
                            <h2 className="mt-1.5 text-[11px] text-red-500 font-medium">Sản phẩm chỉ còn {item.stockQuantity} cái</h2>
                          )}
                        </div>

                        <div className="mt-auto flex items-end justify-between pt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setItemToDelete(item.id); }}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            title="Xoá sản phẩm"
                          >
                            <DeleteOutlined className="text-[15px]" />
                            <span className="text-[13px]">Xóa</span>
                          </button>

                          <div className="flex flex-col items-end">
                            <span className="text-[16px] font-black text-gray-900 leading-none">
                              {item.subtotal.toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-6 bg-gray-50 border-t space-y-4 border-stone-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">{t('cart.total')}:</span>
                    <span className="text-2xl font-bold text-showcase-primary">{totalAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/checkout');
                        setIsCartOpen(false);
                      }}
                      className="w-full py-4 bg-showcase-primary cursor-pointer text-white font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-showcase-primary/20 transition-all"
                    >
                      {t('cart.checkout')}
                    </button>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/san-pham');
                      }}
                      className="w-full cursor-pointer py-4 bg-white text-gray-700 border border-gray-200  font-bold hover:bg-showcase-primary/10 transition-all"
                    >
                      {t('cart.continue_shopping')}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Confirm Delete Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <DeleteOutlined className="text-2xl text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Xoá sản phẩm</h3>
                <p className="text-gray-500 text-sm mb-6">Bạn có chắc chắn muốn xoá sản phẩm này khỏi giỏ hàng không?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setItemToDelete(null)}
                    className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                  >
                    Huỷ bỏ
                  </button>
                  <button
                    onClick={() => {
                      if (itemToDelete) {
                        removeFromCart(itemToDelete);
                        setItemToDelete(null);
                      }
                    }}
                    className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    Xoá ngay
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer - Full Screen Slide */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[100] flex flex-col xl:hidden"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <div className="w-[100px]">
                <img src="/assets/images/image-logo.png" alt="Logo" className="w-full h-auto" />
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <CloseOutlined className="text-lg" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <div key={link.title} className="border-b border-gray-50 last:border-0">
                    <div className="flex items-center justify-between py-4">
                      <Link
                        to={link.href}
                        target={link.target}
                        className="text-lg font-bold !text-gray-900 uppercase tracking-tight"
                        onClick={() => !link.submenu && setIsMenuOpen(false)}
                      >
                        {link.title}
                      </Link>
                    </div>
                    {link.submenu && (
                      <div className="pb-4 pl-4 space-y-3">
                        {link.submenu.map((sub) => (
                          <a
                            key={sub.title}
                            href={sub.href}
                            className="block !text-gray-500 font-medium hover:text-showcase-primary"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {sub.title}
                          </a>
                        ))}
                      </div>
                    )}
                    {/* Danh mục Sản Phẩm trên mobile - Accordion */}
                    {link.href === ROUTES.SAN_PHAM && productCategories.length > 0 && (
                      <div className="pb-4 pl-4 space-y-1">
                        {productCategories.map((cat: any) => {
                          const catId = String(cat.id || cat._id);
                          const isExpanded = expandedCategories.has(catId);
                          const hasChildren = cat.children && cat.children.length > 0;
                          return (
                            <div key={catId}>
                              <button
                                type="button"
                                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 !text-gray-900 hover:!text-showcase-primary hover:bg-gray-100 text-[15px] font-semibold transition-colors"
                                onClick={() => {
                                  if (hasChildren) {
                                    setExpandedCategories(prev => {
                                      const next = new Set(prev);
                                      if (next.has(catId)) next.delete(catId);
                                      else next.add(catId);
                                      return next;
                                    });
                                  } else {
                                    navigate(`${ROUTES.DANH_SACH_SAN_PHAM}?search=${cat.slug}`);
                                    setIsMenuOpen(false);
                                  }
                                }}
                              >
                                <span>{cat.name}</span>
                                {hasChildren && (
                                  <DownOutlined
                                    className={`text-[10px] text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                  />
                                )}
                              </button>
                              {hasChildren && isExpanded && (
                                <div className="pl-3 mt-1 space-y-0.5">
                                  {cat.children.map((child: any) => (
                                    <a
                                      key={child.id || child._id}
                                      href={`${ROUTES.DANH_SACH_SAN_PHAM}?search=${child.slug}`}
                                      className="flex items-center gap-2 py-2 px-3 rounded-lg !text-gray-600 hover:!text-showcase-primary hover:bg-gray-50 text-[13px] transition-colors"
                                      onClick={() => setIsMenuOpen(false)}
                                    >
                                      <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                                      {child.name}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Danh mục Công Trình trên mobile */}
                    {link.href === ROUTES.CONG_TRINH && congTrinhCategories.length > 0 && (
                      <div className="pb-4 pl-4 space-y-1">
                        {congTrinhCategories.map((cat) => (
                          <a
                            key={cat._id || cat.id}
                            href={`${ROUTES.CONG_TRINH}?category=${cat._id || cat.id}`}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 !text-gray-900 hover:!text-showcase-primary hover:bg-gray-100 text-sm font-medium transition-colors mb-1"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <span>{cat.name}</span>
                            <ArrowRightOutlined className="text-[10px] text-gray-500" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-10 space-y-6">
                <div>
                  <p className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">{t('common.language')}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ${i18n.language === lang.code
                          ? 'bg-showcase-primary/10 border-showcase-primary text-showcase-primary'
                          : 'bg-gray-50 border-transparent text-gray-600'
                          }`}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="text-[10px] font-bold">{lang.code.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gray-900 rounded-3xl text-white">
                  <p className="text-xs font-bold text-gray-400 mb-2">{t('common.contact_us')}</p>
                  <h3 className="text-xl font-black mb-4">090 123 4567</h3>
                  <button className="w-full py-3 bg-showcase-primary rounded-xl font-bold text-sm">
                    {t('common.send_request')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;