import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '@/src/features/showcase/components/ui/Container';
import { useCart } from '@/src/features/showcase/context/CartContext';
import { useOrderService } from '@/src/api/services';
import api from '@/src/api/axiosInstance';
import SEO from '@/src/components/common/SEO';
import Badge from '@/src/features/showcase/components/ui/Badge';
import {
  ArrowLeftOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  ShoppingOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const { cartItems, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    note: '',
    deliveryTime: 'business_hours',
    paymentMethod: 'cash',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!customer.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!customer.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^\d{10,11}$/.test(customer.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!customer.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOrder = async () => {
    if (!validate()) {
      toast.error('Vui lòng điền đầy đủ và chính xác các thông tin bắt buộc.');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Giỏ hàng đang trống');
      return;
    }

    try {
      await api.post('/orders/checkout', {
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email || 'guest@hochi.vn',
        address: customer.address,
        deliveryTime: customer.deliveryTime
      });

      toast.success('Tạo đơn hàng thành công! Cảm ơn bạn đã tin tưởng Nội Thất Hochi.');
      clearCart();
      navigate('/');
    } catch (err: any) {
      console.error('Lỗi khi thiết lập đơn hàng:', err);
      toast.error('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
    }
  };

  return (
    <div className="bg-[#FBFCFD] min-h-screen font-sans selection:bg-teal-100">
      <SEO
        title={t('checkout.page_title')}
        description="Hoàn tất đơn hàng nội thất cao cấp của bạn tại Nội Thất Hochi."
      />

      <main className="pt-32 pb-24">
        <Container>
          {/* Breadcrumbs */}
          <div className="mb-8 flex items-center gap-2 text-sm !text-gray-400">
            <Link to="/" className="hover:text-showcase-primary transition-colors !text-gray-400">{t('checkout.breadcrumb_home')}</Link>
            <span>/</span>
            <Link to="/san-pham" className="hover:text-showcase-primary transition-colors !text-gray-400">{t('checkout.breadcrumb_products')}</Link>
            <span>/</span>
            <span className="text-teal-950 font-medium">{t('checkout.breadcrumb_checkout')}</span>
          </div>

          <div className="mb-12">
            <Badge variant="gold">{t('checkout.badge')}</Badge>
            <h1 className="mt-4 text-4xl font-bold text-teal-950 uppercase tracking-tight">
              {t('checkout.page_title')}
            </h1>
            <div className="mt-4 h-1 w-24 bg-showcase-primary"></div>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Left Column - Forms */}
            <div className="space-y-8 lg:col-span-2">
              {/* Customer Info Card */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                  <UserOutlined className="text-showcase-primary text-xl" />
                  <h2 className="text-lg font-bold text-teal-950 uppercase tracking-wider">{t('checkout.customer_info')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('checkout.full_name')} *</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder={t('checkout.full_name_placeholder')}
                      value={customer.fullName}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${errors.fullName ? 'border-red-500' : 'border-gray-200 focus:border-showcase-primary focus:ring-1 focus:ring-showcase-primary/20'} px-4 py-3.5 outline-none transition-all bg-gray-50/30`}
                    />
                    {errors.fullName && <p className="mt-1 text-[10px] text-red-500 uppercase tracking-wider">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('checkout.phone')} *</label>
                    <input
                      type="text"
                      name="phone"
                      placeholder={t('checkout.phone_placeholder')}
                      value={customer.phone}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-showcase-primary focus:ring-1 focus:ring-showcase-primary/20'} px-4 py-3.5 outline-none transition-all bg-gray-50/30`}
                    />
                    {errors.phone && <p className="mt-1 text-[10px] text-red-500 uppercase tracking-wider">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('checkout.email')}</label>
                    <input
                      type="email"
                      name="email"
                      placeholder={t('checkout.email_placeholder')}
                      value={customer.email}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-showcase-primary focus:ring-1 focus:ring-showcase-primary/20'} px-4 py-3.5 outline-none transition-all bg-gray-50/30`}
                    />
                    {errors.email && <p className="mt-1 text-[10px] text-red-500 uppercase tracking-wider">{errors.email}</p>}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('checkout.address_label')} *</label>
                    <input
                      type="text"
                      name="address"
                      placeholder={t('checkout.address_placeholder')}
                      value={customer.address}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-showcase-primary focus:ring-1 focus:ring-showcase-primary/20'} px-4 py-3.5 outline-none transition-all bg-gray-50/30`}
                    />
                    {errors.address && <p className="mt-1 text-[10px] text-red-500 uppercase tracking-wider">{errors.address}</p>}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('checkout.note_label')}</label>
                    <textarea
                      name="note"
                      placeholder={t('checkout.note_placeholder')}
                      value={customer.note}
                      onChange={handleChange}
                      className="min-h-[140px] w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all focus:border-showcase-primary focus:ring-1 focus:ring-showcase-primary/20 bg-gray-50/30 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Time Card */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                  <ClockCircleOutlined className="text-showcase-primary text-xl" />
                  <h2 className="text-lg font-bold text-teal-950 uppercase tracking-wider">{t('checkout.delivery_title')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8">
                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${customer.deliveryTime === 'business_hours'
                      ? 'border-showcase-primary bg-showcase-light/10 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryTime"
                        className="h-4 w-4 text-showcase-primary focus:ring-showcase-primary"
                        checked={customer.deliveryTime === 'business_hours'}
                        onChange={() => setCustomer({ ...customer, deliveryTime: 'business_hours' })}
                      />
                      <span className="font-semibold text-teal-950">{t('checkout.delivery_business')}</span>
                    </div>
                    <span className="text-xs text-gray-500 italic">{t('checkout.delivery_business_time')}</span>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${customer.deliveryTime === 'outside_business_hours'
                      ? 'border-showcase-primary bg-showcase-light/10 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryTime"
                        className="h-4 w-4 text-showcase-primary focus:ring-showcase-primary"
                        checked={customer.deliveryTime === 'outside_business_hours'}
                        onChange={() => setCustomer({ ...customer, deliveryTime: 'outside_business_hours' })}
                      />
                      <span className="font-semibold text-teal-950">{t('checkout.delivery_outside')}</span>
                    </div>
                    <span className="text-xs text-gray-500 italic">{t('checkout.delivery_outside_time')}</span>
                  </label>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                  <CreditCardOutlined className="text-showcase-primary text-xl" />
                  <h2 className="text-lg font-bold text-teal-950 uppercase tracking-wider">{t('checkout.payment_title')}</h2>
                </div>
                <div className="space-y-4 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${customer.paymentMethod === 'cash'
                        ? 'border-showcase-primary bg-showcase-light/10'
                        : 'border-gray-100 hover:border-gray-200'
                        }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={customer.paymentMethod === 'cash'}
                        onChange={() => setCustomer({ ...customer, paymentMethod: 'cash' })}
                      />
                      <span className="font-semibold text-teal-950">{t('checkout.payment_cash')}</span>
                    </label>
                  </div>

                  <div className="mt-6 rounded-xl bg-gray-50 p-6 border border-dashed border-gray-200">
                    <p className="text-gray-600 text-sm leading-relaxed italic">
                      "{t('checkout.payment_note')}"
                    </p>
                    <p className="mt-4 text-sm font-medium text-teal-950/80">
                      {t('checkout.payment_hotline')}: <span className="text-red-600 font-bold hover:underline cursor-pointer">0911.972.789</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="h-fit">
              <div className="sticky top-32 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center gap-3 bg-teal-950 px-6 py-5 text-white">
                  <ShoppingOutlined className="text-xl" />
                  <h2 className="font-bold uppercase tracking-widest">{t('checkout.order_title')}</h2>
                  <span className="ml-auto rounded-full bg-showcase-primary px-2.5 py-0.5 text-xs font-bold text-white">
                    {cartItems.length}
                  </span>
                </div>

                <div className="p-6">
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <ShoppingOutlined className="text-6xl mb-4 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500 mb-6">{t('checkout.cart_empty') || 'Giỏ hàng của bạn đang trống'}</p>
                      <Link to="/san-pham" className="px-6 py-2.5 bg-showcase-primary text-white font-bold rounded-lg hover:bg-[#bea748] transition-colors shadow-sm tracking-wide">
                        Tiếp tục mua sắm
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {cartItems.map((item) => (
                          <div key={item.id} className="group mb-4 border-b border-gray-50 pb-4 last:border-b-0 last:mb-0">
                            <div className="flex gap-4">
                              <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                />
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="absolute top-1 right-1 rounded-full bg-red-500/80 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                                >
                                  <DeleteOutlined className="text-xs" />
                                </button>
                              </div>

                              <div className="min-w-0 flex-1 flex flex-col justify-between">
                                <div>
                                  <h3 className="line-clamp-2 text-sm font-bold text-teal-950 transition-colors hover:text-showcase-primary">
                                    {item.title}
                                  </h3>
                                  <p className="mt-1 text-xs text-gray-400 font-medium">
                                    {t('checkout.unit_price')}: {item.price.toLocaleString('vi-VN')} đ
                                  </p>
                                  <p className="text-sm font-bold text-showcase-primary mt-1">
                                    {item.subtotal.toLocaleString('vi-VN')} <span className="text-[10px] uppercase">{t('common.vnd')}</span>
                                  </p>
                                </div>

                                <div className="mt-3 flex items-center justify-between">
                                  <div className="flex items-center rounded-lg border border-gray-100 bg-gray-50 overflow-hidden">
                                    <button
                                      className="px-2.5 py-1 text-gray-400 hover:bg-gray-100 transition-colors"
                                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                    >
                                      <MinusOutlined className="text-xs" />
                                    </button>
                                    <span className="w-8 text-center text-xs font-bold text-teal-950">{item.quantity}</span>
                                    <button
                                      className="px-2.5 py-1 text-gray-400 hover:bg-gray-100 transition-colors"
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    >
                                      <PlusOutlined className="text-xs" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-gray-400 text-sm">
                          <span>{t('checkout.subtotal')}</span>
                          <span className="font-medium text-gray-600">
                            {totalAmount.toLocaleString('vi-VN')} {t('common.vnd')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-gray-400 text-sm">
                          <span>{t('checkout.shipping')}</span>
                          <span className="text-teal-600 font-bold uppercase tracking-wider text-[10px]">{t('checkout.shipping_note')}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-lg font-bold text-teal-950 uppercase">{t('checkout.total')}</span>
                          <div className="text-right">
                            <p className="text-2xl font-black text-showcase-primary leading-none">
                              {totalAmount.toLocaleString('vi-VN')} <span className="text-sm">{t('common.vnd')}</span>
                            </p>
                            <span className="text-[10px] text-gray-400 italic">{t('checkout.tax_note')}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleOrder}
                        className="relative w-full overflow-hidden rounded-xl bg-teal-950 py-4.5 text-center font-bold text-white shadow-lg transition-all hover:bg-black hover:shadow-2xl active:scale-[0.98] group"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest">
                          {t('checkout.submit')} <ArrowLeftOutlined className="rotate-180" />
                        </span>
                        <div className="absolute inset-0 -translate-x-full bg-showcase-primary transition-transform group-hover:translate-x-0 group-hover:transition-all duration-300 opacity-20"></div>
                      </button>

                      <p className="text-center text-[10px] text-gray-400 mt-4 leading-relaxed px-4">
                        {t('checkout.terms')} <span className="underline cursor-pointer">{t('checkout.terms_link')}</span> và <span className="underline cursor-pointer">{t('checkout.warranty_link')}</span> của Nội Thất Hochi.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;