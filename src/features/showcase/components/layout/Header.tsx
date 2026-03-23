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
} from '@ant-design/icons';
import Container from '../ui/Container';
import { useCart } from '../../context/CartContext';
import { useTranslation } from 'react-i18next';
import { useConstructionCategoryService, useCategoryService } from '@/src/api/services';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const cartRef = useRef<HTMLDivElement | null>(null);
  const cartButtonRef = useRef<HTMLDivElement | null>(null);
  const cartDrawerRef = useRef<HTMLDivElement | null>(null);
  const { cartItems, cartCount, totalAmount, updateQuantity, removeFromCart } = useCart();

  // ─── Danh mục công trình ───
  const { getAll: getCongTrinhCategories } = useConstructionCategoryService();
  const [congTrinhCategories, setCongTrinhCategories] = React.useState<any[]>([]);

  // ─── Danh mục sản phẩm ───
  const { list: apiCategories, getAll: getProductCategories } = useCategoryService();
  const [productCategories, setProductCategories] = React.useState<any[]>([]);

  React.useEffect(() => {
    getCongTrinhCategories({ limit: 20 })
      .then((res) => setCongTrinhCategories(res || []))
      .catch(() => {});
      
    getProductCategories({ limit: 50 }).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (apiCategories) setProductCategories(apiCategories);
  }, [apiCategories]);

  const currentLang = i18n.language?.toUpperCase().substring(0, 2) || 'VI';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <Container className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="relative z-50 transition-transform hover:scale-105">
            <div className="w-[100px] sm:w-[120px]">
              <img
                src="/assets/images/image-logo.png"
                alt="Nội Thất Hochi"
                className={`w-full h-auto object-contain transition-all duration-300 ${!isDarkHeader ? 'brightness-0 invert' : ''}`}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-x-4">
            {navLinks.map((link) => (
              <div key={link.title} className="relative group">
                <Link
                  to={link.href}
                  target={link.target}
                  className={`text-[13px] font-bold uppercase tracking-wide whitespace-nowrap transition-all duration-300 hover:text-showcase-primary flex items-center gap-1 ${isDarkHeader ? '!text-gray-800' : '!text-white'
                    }`}
                >
                  {link.title}
                  {link.submenu && <DownOutlined className="text-[8px] transition-transform group-hover:rotate-180" />}
                  {link.href === ROUTES.CONG_TRINH && congTrinhCategories.length > 0 && <DownOutlined className="text-[8px] transition-transform group-hover:rotate-180" />}
                  {link.href === ROUTES.SAN_PHAM && productCategories.length > 0 && <DownOutlined className="text-[8px] transition-transform group-hover:rotate-180" />}
                </Link>

                {link.submenu && (
                  <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white py-4 min-w-[240px] border border-gray-100 overflow-hidden">
                      {link.submenu.map((sub) => (
                        <Link
                          key={sub.title}
                          to={sub.href}
                          className="flex items-center justify-between px-6 py-3 text-[13px] font-medium !text-gray-700 hover:text-showcase-primary hover:bg-gray-50 transition-colors"
                        >
                          {sub.title}
                          <ArrowRightOutlined className="text-[10px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submenu Sản Phẩm */}
                {link.href === ROUTES.SAN_PHAM && productCategories.length > 0 && (
                  <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="bg-white py-3 min-w-[260px] border border-gray-100 overflow-visible relative">
                      <p className="px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Danh mục sản phẩm</p>
                      {productCategories.map((cat: any) => (
                        <div key={cat.id || cat._id} className="relative group/parent">
                          <Link
                            to={`${ROUTES.DANH_SACH_SAN_PHAM}?slug=${cat.slug}`}
                            className="flex items-center justify-between px-5 py-2.5 text-[13px] font-medium !text-gray-700 hover:text-showcase-primary hover:bg-gray-50 transition-colors group/item"
                          >
                            <span>{cat.name}</span>
                            <ArrowRightOutlined className="text-[10px] text-gray-300 group-hover/item:text-showcase-primary group-hover/item:translate-x-1 transition-all duration-200" />
                          </Link>
                          
                          {/* Child categories flyout */}
                          {cat.children && cat.children.length > 0 && (
                            <div className="absolute top-0 left-full pl-0 opacity-0 invisible group-hover/parent:opacity-100 group-hover/parent:visible transition-all duration-300 -translate-x-2 group-hover/parent:translate-x-0 z-[60]">
                              <div className="bg-white py-3 min-w-[260px] border border-gray-100 overflow-hidden ml-1">
                                {cat.children.map((child: any) => (
                                  <Link
                                    key={child.id || child._id}
                                    to={`${ROUTES.DANH_SACH_SAN_PHAM}?slug=${child.slug}`}
                                    className="flex items-center justify-between px-5 py-2.5 text-[13px] font-medium !text-gray-700 hover:text-showcase-primary hover:bg-gray-50 transition-colors group/subitem"
                                  >
                                    <span>{child.name}</span>
                                    <ArrowRightOutlined className="text-[10px] text-gray-200 opacity-0 group-hover/subitem:opacity-100 group-hover/subitem:text-showcase-primary group-hover/subitem:translate-x-1 transition-all duration-200 -translate-x-2" />
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <Link
                          to={ROUTES.SAN_PHAM}
                          className="flex items-center justify-between px-5 py-2.5 text-[12px] font-bold !text-showcase-primary hover:!text-gray-900 hover:bg-gray-50 transition-colors uppercase tracking-wide group/all"
                        >
                          Xem tất cả
                          <ArrowRightOutlined className="text-[10px] transition-transform group-hover/all:translate-x-1 duration-200" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submenu Công Trình - nền đen */}
                {link.href === ROUTES.CONG_TRINH && congTrinhCategories.length > 0 && (
                  <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="bg-gray-950 py-3 min-w-[260px] overflow-hidden">
                      <p className="px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Danh mục</p>
                      {congTrinhCategories.map((cat) => (
                        <Link
                          key={cat._id || cat.id}
                          to={`${ROUTES.CONG_TRINH}?category=${cat._id || cat.id}`}
                          className="flex items-center justify-between px-5 py-2.5 text-[13px] font-medium !text-gray-200 hover:!text-white hover:bg-white/10 transition-colors group/item"
                        >
                          <span>{cat.name}</span>
                          <ArrowRightOutlined className="text-[10px] text-gray-500 group-hover/item:text-white group-hover/item:translate-x-1 transition-all duration-200" />
                        </Link>
                      ))}
                      <div className="border-t border-white/10 mt-2 pt-2">
                        <Link
                          to={ROUTES.CONG_TRINH}
                          className="flex items-center justify-between px-5 py-2.5 text-[12px] font-bold !text-showcase-primary hover:!text-white hover:bg-white/10 transition-colors uppercase tracking-wide"
                        >
                          Xem tất cả
                          <ArrowRightOutlined className="text-[10px]" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 ml-6 lg:ml-8">
            {/* Search Bar - Desktop */}
            <div className={`hidden md:flex items-center bg-white rounded-full px-4 py-2 border transition-all shadow-sm ${isDarkHeader ? 'border-gray-200' : 'border-white/20'}`}>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="bg-transparent outline-none text-[13px] w-[150px] lg:w-[220px] text-gray-800 placeholder-gray-400"
              />
              <SearchOutlined className="text-gray-400 text-lg ml-2 hover:text-showcase-primary cursor-pointer transition-colors" />
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
                        className="absolute -top-2.5 -right-3.5 bg-showcase-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span className="font-bold uppercase text-[12px] tracking-wider hidden sm:block">Giỏ hàng</span>
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-full transition-all ${isDarkHeader ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-white/10'
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

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                      onClick={() => setIsCartOpen(false)}
                      className="px-8 py-3 bg-showcase-primary text-white rounded-full font-bold hover:opacity-90 transition-opacity"
                    >
                      {t('cart.continue_shopping')}
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-bold !text-gray-900 line-clamp-2 leading-tight">{item.title}</h4>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <DeleteOutlined />
                            </button>
                          </div>
                          <p className="text-showcase-primary font-black mt-1">{item.price.toLocaleString('vi-VN')} đ</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-gray-50 rounded-full px-2 py-1 border border-stone-100">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center !text-gray-500 hover:text-gray-900"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center !text-gray-500 hover:text-gray-900"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-xs font-medium text-gray-400">
                            {t('cart.subtotal')}: <span className="text-gray-900 font-bold">{item.subtotal.toLocaleString('vi-VN')} đ</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-6 bg-gray-50 border-t space-y-4 border-stone-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">{t('cart.total')}:</span>
                    <span className="text-2xl font-black text-showcase-primary">{totalAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/checkout');
                        setIsCartOpen(false);
                      }}
                      className="w-full py-4 bg-showcase-primary text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-lg hover:shadow-showcase-primary/20 transition-all"
                    >
                      {t('cart.checkout')}
                    </button>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="w-full py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold hover:bg-gray-100 transition-all"
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

      {/* Mobile Menu Drawer - Full Screen Slide */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[100] flex flex-col lg:hidden"
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
                          <Link
                            key={sub.title}
                            to={sub.href}
                            className="block !text-gray-500 font-medium hover:text-showcase-primary"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                    {/* Danh mục Sản Phẩm trên mobile */}
                    {link.href === ROUTES.SAN_PHAM && productCategories.length > 0 && (
                      <div className="pb-4 pl-4 space-y-1">
                        {productCategories.map((cat: any) => (
                          <div key={cat.id || cat._id} className="mb-1">
                            <Link
                              to={`${ROUTES.DANH_SACH_SAN_PHAM}?slug=${cat.slug}`}
                              className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 text-gray-700 hover:text-showcase-primary hover:bg-gray-100 text-[13px] font-medium transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <span>{cat.name}</span>
                            </Link>
                            {cat.children && cat.children.length > 0 && (
                              <div className="pl-4 mt-1 space-y-1">
                                {cat.children.map((child: any) => (
                                  <Link
                                    key={child.id || child._id}
                                    to={`${ROUTES.DANH_SACH_SAN_PHAM}?slug=${child.slug}`}
                                    className="flex items-center py-2 px-3 rounded-lg text-gray-500 hover:text-showcase-primary text-[12px] transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    - {child.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Danh mục Công Trình trên mobile */}
                    {link.href === ROUTES.CONG_TRINH && congTrinhCategories.length > 0 && (
                      <div className="pb-4 pl-4 space-y-1">
                        {congTrinhCategories.map((cat) => (
                          <Link
                            key={cat._id || cat.id}
                            to={`${ROUTES.CONG_TRINH}?category=${cat._id || cat.id}`}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-950 text-gray-200 hover:text-white hover:bg-black text-sm font-medium transition-colors mb-1"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <span>{cat.name}</span>
                            <ArrowRightOutlined className="text-[10px] text-gray-500" />
                          </Link>
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