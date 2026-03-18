import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useCartService } from '@/src/api/services';

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  totalAmount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { request } = useCartService();

  const fetchCart = async () => {
    try {
      const res = await request('GET', '');
      if (res?.data?.items) {
        const mappedItems: CartItem[] = res.data.items.map((it: any) => ({
          id: it.productId?.id || it.productId?._id,
          slug: it.productId?.slug || it.productId?.id,
          title: it.productId?.name || 'Sản phẩm',
          price: it.productId?.price || 0,
          image: it.productId?.images?.[0]?.url || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800',
          quantity: it.quantity
        }));
        setCartItems(mappedItems);
      }
    } catch (err) {
      console.error('Không thể lấy giỏ hàng từ máy chủ', err);
    }
  };

  useEffect(() => {
    // Tải giỏ hàng từ Backend mỗi khi vào trang
    fetchCart();
  }, []);

  const addToCart = async (item: CartItem) => {
    // 1. Cập nhật state (Optimistic UI) để báo hiệu cho người dùng ngay lập tức
    setCartItems((prev) => {
      const existed = prev.find((p) => p.id === item.id);
      if (existed) {
        return prev.map((p) =>
          p.id === item.id
            ? { ...p, quantity: p.quantity + item.quantity }
            : p
        );
      }
      return [...prev, item];
    });

    // 2. Gọi API để lưu dữ liệu thật vào DB
    try {
      await request('POST', '/add', { 
        productId: item.id, 
        quantity: item.quantity 
      });
      // (Tùy chọn) Gắn thêm fetchCart() ở đây nếu muốn đồng bộ ngược lại từ backend sau khi thêm
    } catch (err) {
      console.error('Lỗi khi lưu giỏ hàng lên server', err);
      // Nếu lưu thất bại, kéo lại giỏ hàng từ DB để đảm bảo dữ liệu đúng
      fetchCart();
    }
  };

  const removeFromCart = async (id: string) => {
    // 1. Optimistic UI: Xóa ngay trên giao diện
    setCartItems((prev) => prev.filter((item) => item.id !== id));

    // 2. Lệnh gọi API để xóa thật dưới Database
    try {
      await request('DELETE', `/remove/${id}`);
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng trên server', err);
      // Rollback lại giỏ hàng đúng nếu lỗi mạng
      fetchCart();
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    // 1. Optimistic UI: Đổi số lượng trên giao diện ngay lập tức
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );

    // 2. Gọi API để lưu dữ liệu thật
    try {
      // Dùng PUT hoặc POST tùy theo setup BE, ở đây dự đoán POST vì giống /add
      await request('POST', '/update', { 
        productId: id, 
        quantity: quantity 
      });
    } catch (err) {
      console.error('Lỗi khi cập nhật số lượng giỏ hàng', err);
      // Rollback lại giỏ hàng đúng nếu lỗi
      fetchCart();
    }
  };

  const clearCart = () => setCartItems([]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const totalAmount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        totalAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được dùng trong CartProvider');
  }
  return context;
};