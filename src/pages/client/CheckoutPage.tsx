import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '@/src/features/showcase/components/ui/Container';
import { useCart } from '@/src/features/showcase/context/CartContext';
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

const CheckoutPage: React.FC = () => {
  const { cartItems, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart();

  const [customer, setCustomer] = useState({
    fullName: '',
    phone: '',
    address: '',
    note: '',
    deliveryTime: 'business-hours',
    paymentMethod: 'cash',
  });

  const handleOrder = () => {
    if (!customer.fullName || !customer.phone || !customer.address) {
      alert('Vui lòng nhập đầy đủ thông tin khách hàng');
      return;
    }

    if (cartItems.length === 0) {
      alert('Giỏ hàng đang trống');
      return;
    }


    // TODO: Gửi đơn hàng lên API

    alert('Đặt hàng thành công!');
    clearCart();
  };

  return (
    <div className="bg-[#FBFCFD] min-h-screen font-sans selection:bg-teal-100">
      <SEO
        title="Xác nhận đơn hàng"
        description="Hoàn tất đơn hàng nội thất cao cấp của bạn tại Nội Thất Hochi."
      />

      <main className="pt-32 pb-24">
        <Container>
          {/* Breadcrumbs */}
          <div className="mb-8 flex items-center gap-2 text-sm !text-gray-400">
            <Link to="/" className="hover:text-showcase-primary transition-colors !text-gray-400">Trang chủ</Link>
            <span>/</span>
            <Link to="/san-pham" className="hover:text-showcase-primary transition-colors !text-gray-400">Sản phẩm</Link>
            <span>/</span>
            <span className="text-teal-950 font-medium">Xác nhận đơn hàng</span>
          </div>

          <div className="mb-12">
            <Badge variant="gold">QUY TRÌNH THANH TOÁN</Badge>
            <h1 className="mt-4 text-4xl font-bold text-teal-950 uppercase tracking-tight">
              Xác nhận đơn hàng
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
                  <h2 className="text-lg font-bold text-teal-950 uppercase tracking-wider">Thông tin phối hợp</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Họ và tên</label>
                    <input
                      type="text"
                      placeholder="Nhập họ và tên khách hàng"
                      value={customer.fullName}
                      onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all focus:border-showcase-primary focus:ring-1 focus:ring-showcase-primary/20 bg-gray-50/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Số điện thoại</label>
                    <input
                      type="text"
                      placeholder="Nhập số điện thoại liên lạc"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all focus:border-showcase-primary focus:ring-1 focus:ring-showcase-primary/20 bg-gray-50/30"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Địa chỉ công trình/nhận hàng</label>
                    <input
                      type="text"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all focus:border-showcase-primary focus:ring-1 focus:ring-showcase-primary/20 bg-gray-50/30"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ghi chú đặc biệt cho kiến trúc sư</label>
                    <textarea
                      placeholder="Ví dụ: Cần hóa đơn GTGT, tư vấn thêm về màu gỗ, thời gian thi công..."
                      value={customer.note}
                      onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
                      className="min-h-[140px] w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all focus:border-showcase-primary focus:ring-1 focus:ring-showcase-primary/20 bg-gray-50/30 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Time Card */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                  <ClockCircleOutlined className="text-showcase-primary text-xl" />
                  <h2 className="text-lg font-bold text-teal-950 uppercase tracking-wider">Thời gian bàn giao mong muốn</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8">
                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${customer.deliveryTime === 'business-hours'
                      ? 'border-showcase-primary bg-showcase-light/10 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryTime"
                        className="h-4 w-4 text-showcase-primary focus:ring-showcase-primary"
                        checked={customer.deliveryTime === 'business-hours'}
                        onChange={() => setCustomer({ ...customer, deliveryTime: 'business-hours' })}
                      />
                      <span className="font-semibold text-teal-950">Trong giờ hành chính</span>
                    </div>
                    <span className="text-xs text-gray-500 italic">08:00 - 17:00</span>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${customer.deliveryTime === 'after-hours'
                      ? 'border-showcase-primary bg-showcase-light/10 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryTime"
                        className="h-4 w-4 text-showcase-primary focus:ring-showcase-primary"
                        checked={customer.deliveryTime === 'after-hours'}
                        onChange={() => setCustomer({ ...customer, deliveryTime: 'after-hours' })}
                      />
                      <span className="font-semibold text-teal-950">Ngoài giờ hành chính</span>
                    </div>
                    <span className="text-xs text-gray-500 italic">Sau 17:00</span>
                  </label>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                  <CreditCardOutlined className="text-showcase-primary text-xl" />
                  <h2 className="text-lg font-bold text-teal-950 uppercase tracking-wider">Phương thức thanh toán</h2>
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
                      <span className="font-semibold text-teal-950">Thanh toán tiền mặt</span>
                    </label>

                    {/* <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${customer.paymentMethod === 'bank'
                        ? 'border-showcase-primary bg-showcase-light/10'
                        : 'border-gray-100 hover:border-gray-200'
                        }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={customer.paymentMethod === 'bank'}
                        onChange={() => setCustomer({ ...customer, paymentMethod: 'bank' })}
                      />
                      <span className="font-semibold text-teal-950">Thanh toán chuyển khoản</span>
                    </label> */}
                  </div>

                  <div className="mt-6 rounded-xl bg-gray-50 p-6 border border-dashed border-gray-200">
                    <p className="text-gray-600 text-sm leading-relaxed italic">
                      "Sau khi nhận được xác nhận đơn hàng, đội ngũ kiến trúc sư của Nội Thất Hochi sẽ liên hệ trực tiếp với bạn trong vòng 30 phút để kiểm tra lại thông tin và tư vấn kỹ thuật."
                    </p>
                    <p className="mt-4 text-sm font-medium text-teal-950/80">
                      Hỗ trợ trực tiếp qua Hotline: <span className="text-red-600 font-bold hover:underline cursor-pointer">0911.972.789</span>
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
                  <h2 className="font-bold uppercase tracking-widest">Đơn hàng của bạn</h2>
                  <span className="ml-auto rounded-full bg-showcase-primary px-2.5 py-0.5 text-xs font-bold text-white">
                    {cartItems.length}
                  </span>
                </div>

                <div className="p-6">
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-30">
                      <ShoppingOutlined className="text-6xl mb-4" />
                      <p className="text-sm font-medium">Giỏ hàng đang trống</p>
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
                                  <p className="mt-1 text-sm font-bold text-showcase-primary">
                                    {item.price.toLocaleString('vi-VN')} <span className="text-[10px] uppercase">vnd</span>
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
                          <span>Tạm tính</span>
                          <span className="font-medium text-gray-600">
                            {totalAmount.toLocaleString('vi-VN')} vnđ
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-gray-400 text-sm">
                          <span>Phí vận chuyển & lắp đặt</span>
                          <span className="text-teal-600 font-bold uppercase tracking-wider text-[10px]">Tư vấn sau khi khảo sát</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-lg font-bold text-teal-950 uppercase">Tổng cộng</span>
                          <div className="text-right">
                            <p className="text-2xl font-black text-showcase-primary leading-none">
                              {totalAmount.toLocaleString('vi-VN')} <span className="text-sm">vnđ</span>
                            </p>
                            <span className="text-[10px] text-gray-400 italic">Giá đã bao gồm thuế GTGT</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleOrder}
                        className="relative w-full overflow-hidden rounded-xl bg-teal-950 py-4.5 text-center font-bold text-white shadow-lg transition-all hover:bg-black hover:shadow-2xl active:scale-[0.98] group"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-widest">
                          Hoàn tất đặt sản phẩm <ArrowLeftOutlined className="rotate-180" />
                        </span>
                        <div className="absolute inset-0 -translate-x-full bg-showcase-primary transition-transform group-hover:translate-x-0 group-hover:transition-all duration-300 opacity-20"></div>
                      </button>

                      <p className="text-center text-[10px] text-gray-400 mt-4 leading-relaxed px-4">
                        Bằng cách bấm đặt hàng, bạn đồng ý với các <span className="underline cursor-pointer">Điều khoản dịch vụ</span> và <span className="underline cursor-pointer">Chính sách bảo hành</span> của Nội Thất Hochi.
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