import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '@/src/features/showcase/components/ui/Container';
import SEO from '@/src/components/common/SEO';
import api from '@/src/api/axiosInstance';
import { Search, PackageCheck, Clock3, Truck, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled' | string;

interface OrderItemProduct {
  productName?: string;
  quantity?: number;
  subtotal?: number;
  size?: string;
}

interface LookupOrder {
  id?: string;
  _id?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: OrderStatus;
  totalAmount?: number;
  createdAt?: string;
  items?: OrderItemProduct[];
  paymentMethod?: string;
  deliveryTime?: string;
}


const normalizeOrderList = (res: any): LookupOrder[] => {
  if (!res) return [];
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
};

const normalizeOrderDetail = (res: any): LookupOrder | null => {
  if (!res) return null;
  if (res?.data && typeof res.data === 'object') return res.data;
  if (typeof res === 'object') return res;
  return null;
};

const normalizePhone = (value: string): string => value.replace(/[^\d]/g, '');

const isValidPhone = (value: string): boolean => {
  const phone = normalizePhone(value);
  return /^(0\d{9,10}|84\d{9,10})$/.test(phone);
};

const OrderLookupPage: React.FC = () => {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [orders, setOrders] = useState<LookupOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [orderDetail, setOrderDetail] = useState<LookupOrder | null>(null);

  const statusMeta = useMemo<Record<string, { label: string; className: string; icon: React.ReactNode }>>(() => ({
    pending: {
      label: t('order_lookup.status.pending'),
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <Clock3 className="w-3.5 h-3.5" />,
    },
    confirmed: {
      label: t('order_lookup.status.confirmed'),
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <PackageCheck className="w-3.5 h-3.5" />,
    },
    shipping: {
      label: t('order_lookup.status.shipping'),
      className: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: <Truck className="w-3.5 h-3.5" />,
    },
    delivered: {
      label: t('order_lookup.status.delivered'),
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    cancelled: {
      label: t('order_lookup.status.cancelled'),
      className: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  }), [t]);

  const getPhoneError = (value: string): string => {
    const normalizedPhone = normalizePhone(value);
    if (!normalizedPhone) return t('order_lookup.errors.phone_required');
    if (!isValidPhone(normalizedPhone)) return t('order_lookup.errors.phone_invalid');
    return '';
  };

  const formatDeliveryTime = (deliveryTime?: string): string => {
    if (!deliveryTime) return '-';

    const normalized = deliveryTime.toLowerCase();
    const deliveryTimeMap: Record<string, string> = {
      business_hours: t('order_lookup.delivery.business_hours'),
      outside_business_hours: t('order_lookup.delivery.outside_business_hours'),
    };

    return deliveryTimeMap[normalized] || deliveryTime;
  };

  const canSubmit = useMemo(() => keyword.trim().length > 0, [keyword]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextPhoneError = getPhoneError(keyword);
    if (nextPhoneError) {
      setPhoneError(nextPhoneError);
      setSubmitted(true);
      setOrders([]);
      setOrderDetail(null);
      return;
    }

    const normalizedPhone = normalizePhone(keyword);

    setPhoneError('');

    setLoading(true);
    setSubmitted(true);
    setSelectedOrderId('');
    setOrderDetail(null);

    try {
      const listRes = await api.get(`/orders/lookup/${normalizedPhone}`);

      const foundOrders = normalizeOrderList(listRes).sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });

      setOrders(foundOrders);

      if (foundOrders.length > 0) {
        const firstOrderId = String(foundOrders[0].id || foundOrders[0]._id || '');
        if (firstOrderId) {
          setSelectedOrderId(firstOrderId);
          setOrderDetail(foundOrders[0]);
        }
      }
    } catch (error: any) {
      setOrders([]);
      setOrderDetail(null);
      toast.error(error?.message || t('order_lookup.toast.lookup_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGetDetail = (orderId: string) => {
    if (!orderId) return;

    const selected = orders.find((order) => String(order.id || order._id || '') === orderId) || null;
    setOrderDetail(selected);
    setSelectedOrderId(orderId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={t('order_lookup.seo.title')}
        description={t('order_lookup.seo.description')}
        canonicalPath="/don-hang-cua-ban"
        breadcrumbs={[
          { name: t('order_lookup.breadcrumbs.home'), url: '/' },
          { name: t('order_lookup.breadcrumbs.current'), url: '/don-hang-cua-ban' },
        ]}
      />

      <section className="relative h-60 md:h-75 flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600"
            alt={t('order_lookup.hero.alt')}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <Container className="relative z-10 text-center text-white">
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-widest mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            {t('order_lookup.hero.title')}
          </h1>
          <div className="mt-4 text-sm font-medium opacity-80 flex items-center justify-center gap-2">
            <Link to="/" className="text-white! hover:text-gray-300! transition-colors">{t('order_lookup.breadcrumbs.home')}</Link>
            <span className="text-white!">/</span>
            <span className="text-white!">{t('order_lookup.breadcrumbs.current')}</span>
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          <div className="max-w-5xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-teal-950">{t('order_lookup.title')}</h2>
            <p className="mt-2 text-sm text-gray-500">{t('order_lookup.subtitle')}</p>

            <form className="mt-6" onSubmit={handleLookup}>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="tel"
                  value={keyword}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setKeyword(nextValue);
                    if (!nextValue.trim()) {
                      setPhoneError('');
                      return;
                    }

                    const normalized = normalizePhone(nextValue);
                    if (normalized.length >= 10) {
                      setPhoneError(getPhoneError(nextValue));
                    } else {
                      setPhoneError('');
                    }
                  }}
                  onBlur={() => {
                    if (!keyword.trim()) return;
                    setPhoneError(getPhoneError(keyword));
                  }}
                  placeholder={t('order_lookup.phone_placeholder')}
                  className={`flex-1 rounded-xl border px-4 py-3 outline-none transition-all focus:border-showcase-primary focus:ring-1 focus:ring-showcase-primary/20 ${phoneError ? 'border-red-500' : 'border-gray-200'}`}
                />
                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-showcase-primary text-white font-bold rounded-xl disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-md transition-all"
                >
                  <Search className="w-4 h-4" />
                  {loading ? t('order_lookup.button_loading') : t('order_lookup.button_submit')}
                </button>
              </div>
              {phoneError && <p className="mt-2 text-[12px] text-red-500">{phoneError}</p>}
            </form>
          </div>

          <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-5">
            {submitted && !loading && !phoneError && orders.length === 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center text-gray-500 lg:col-span-2">
                {t('order_lookup.empty_results')}
              </div>
            )}

            {orders.length > 0 && (
              <>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm h-fit">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t('order_lookup.list_title')}</p>
                  <div className="space-y-2">
                    {orders.map((order, index) => {
                      const orderId = String(order.id || order._id || '');
                      const active = selectedOrderId === orderId;

                      return (
                        <button
                          key={orderId || index}
                          type="button"
                          onClick={() => handleGetDetail(orderId)}
                          className={`w-full text-left border rounded-xl p-3 transition-all ${active
                            ? 'border-showcase-primary bg-showcase-primary/5'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                          <p className="text-sm font-bold text-teal-950">{t('order_lookup.order_label')}</p>
                          <p className="text-xs text-gray-500 mt-1">{order.fullName || '-'} - {order.phone || '-'}</p>
                          <p className="text-xs text-gray-400 mt-1">{order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '-'}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 shadow-sm min-h-70">
                  {!orderDetail ? (
                    <div className="h-full flex items-center justify-center text-gray-500">{t('order_lookup.select_prompt')}</div>
                  ) : (
                    (() => {
                      const statusKey = orderDetail.status || 'pending';
                      const meta = statusMeta[statusKey] || {
                        label: orderDetail.status || t('order_lookup.status.unknown'),
                        className: 'bg-gray-50 text-gray-700 border-gray-200',
                        icon: <Clock3 className="w-3.5 h-3.5" />,
                      };

                      return (
                        <>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${meta.className}`}>
                              {meta.icon}
                              {meta.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                            <div>
                              <p className="text-gray-400">{t('order_lookup.detail.recipient')}</p>
                              <p className="font-semibold text-gray-800">{orderDetail.fullName || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">{t('order_lookup.detail.phone')}</p>
                              <p className="font-semibold text-gray-800">{orderDetail.phone || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">{t('order_lookup.detail.email')}</p>
                              <p className="font-semibold text-gray-800">{orderDetail.email || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">{t('order_lookup.detail.order_date')}</p>
                              <p className="font-semibold text-gray-800">
                                {orderDetail.createdAt ? new Date(orderDetail.createdAt).toLocaleString('vi-VN') : '-'}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-gray-400">{t('order_lookup.detail.address')}</p>
                              <p className="font-semibold text-gray-800">{orderDetail.address || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">{t('order_lookup.detail.delivery_time')}</p>
                              <p className="font-semibold text-gray-800">{formatDeliveryTime(orderDetail.deliveryTime)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">{t('order_lookup.detail.payment_method')}</p>
                              <p className="font-semibold text-gray-800">{orderDetail.paymentMethod || '-'}</p>
                            </div>
                          </div>

                          <div className="mt-5 pt-4 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t('order_lookup.detail.items_title')}</p>
                            {(orderDetail.items || []).length === 0 ? (
                              <p className="text-sm text-gray-500">{t('order_lookup.detail.items_empty')}</p>
                            ) : (
                              <div className="space-y-2">
                                {(orderDetail.items || []).map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between gap-3 text-sm border border-gray-100 rounded-lg px-3 py-2">
                                    <p className="font-medium text-gray-800 truncate">{item.productName || t('order_lookup.detail.item_fallback')}</p>
                                    <p className="text-gray-500">{item.size ? `(${item.size})` : ''}</p>
                                    <p className="text-gray-600 whitespace-nowrap">x{item.quantity || 0}</p>
                                    <p className="font-semibold text-gray-900 whitespace-nowrap">{(item.subtotal || 0).toLocaleString('vi-VN')} đ</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-sm text-gray-500">{t('order_lookup.detail.total_label')}</span>
                            <span className="text-lg font-black text-showcase-primary">
                              {(orderDetail.totalAmount || 0).toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        </>
                      );
                    })()
                  )}
                  </div>
              </>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
};

export default OrderLookupPage;
