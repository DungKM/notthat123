import React, { createContext, useContext, useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useCartService } from '@/src/api/services';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  subtotal: number;
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
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const { request, patch } = useCartService();

  // Lưu timer debounce theo từng productId
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const updateCartStateFromAPI = useCallback((data: any) => {
    if (!data?.items) {
      setCartItems([]);
      setTotalAmount(0);
      return;
    }
    const mappedItems: CartItem[] = data.items.map((it: any) => {
      const pId = it.productId?.id || it.productId?._id;
      const price = it.productId?.price || 0;
      return {
        id: pId,
        slug: it.productId?.slug || pId,
        title: it.productId?.name || 'Sản phẩm',
        price: price,
        image: it.productId?.images?.[0]?.url || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800',
        quantity: it.quantity,
        subtotal: it.subtotal || (price * it.quantity),
      };
    });
    setCartItems(mappedItems);
    setTotalAmount(data.totalAmount || 0);
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      const res = await request('GET', '');
      if (res?.data) {
        updateCartStateFromAPI(res.data);
      }
    } catch (err) {
      console.error('Không thể lấy giỏ hàng từ máy chủ', err);
    }
  }, [request, updateCartStateFromAPI]);

  useEffect(() => {
    // Tải giỏ hàng từ Backend mỗi khi vào trang
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (item: CartItem) => {
    // 1. Cập nhật state (Optimistic UI) để báo hiệu cho người dùng ngay lập tức
    setCartItems((prev) => {
      const existed = prev.find((p) => p.id === item.id);
      if (existed) {
        return prev.map((p) => {
          if (p.id === item.id) {
            const newQuantity = p.quantity + item.quantity;
            return { ...p, quantity: newQuantity, subtotal: newQuantity * p.price };
          }
          return p;
        });
      }
      return [...prev, { ...item, subtotal: item.price * item.quantity }];
    });
    setTotalAmount((prev) => prev + (item.price * item.quantity));

    // 2. Gọi API để lưu dữ liệu thật vào DB
    try {
      const res = await request('POST', '/add', {
        productId: item.id,
        quantity: item.quantity
      });
      if (res?.data) updateCartStateFromAPI(res.data);
      else fetchCart();
    } catch (err) {
      console.error('Lỗi khi lưu giỏ hàng lên server', err);
      // Nếu lưu thất bại, kéo lại giỏ hàng từ DB để đảm bảo dữ liệu đúng
      fetchCart();
    }
  };

  const removeFromCart = async (id: string) => {
    // 1. Optimistic UI: Xóa ngay trên giao diện
    const itemToRemove = cartItems.find((item) => item.id === id);
    if (itemToRemove) {
      setTotalAmount((prev) => prev - itemToRemove.subtotal);
    }
    setCartItems((prev) => prev.filter((item) => item.id !== id));

    // 2. Lệnh gọi API để xóa thật dưới Database
    try {
      const res = await request('DELETE', `/remove/${id}`);
      toast.success('Xóa sản phẩm khỏi giỏ hàng thành công');
      if (res?.data) updateCartStateFromAPI(res.data);
      else fetchCart();
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng trên server', err);
      // Rollback lại giỏ hàng đúng nếu lỗi mạng
      fetchCart();
    }
  };

  // Hàm gọi API thật (chỉ được gọi sau khi debounce kết thúc)
  const syncQuantityToServer = useCallback(async (id: string, quantity: number) => {
    try {
      const data = await patch('update', {
        items: [{ productId: id, quantity }]
      });
      if (data) updateCartStateFromAPI(data);
      else fetchCart();
    } catch (err) {
      console.error('Lỗi khi cập nhật số lượng giỏ hàng', err);
      fetchCart();
    }
  }, [patch, updateCartStateFromAPI, fetchCart]);

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    // 1. Optimistic UI: Đổi số lượng trên giao diện NGAY LẬP TỨC (không delay)
    let diffAmount = 0;
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newSubtotal = item.price * quantity;
          diffAmount += newSubtotal - item.subtotal;
          return { ...item, quantity, subtotal: newSubtotal };
        }
        return item;
      })
    );
    // Tạm thời tính UI
    setTotalAmount((prev) => prev + diffAmount);

    // 2. Debounce: Xóa timer cũ của sản phẩm này (nếu đang đợi) rồi đặt timer mới
    //    Chỉ gọi API 1 lần duy nhất sau khi user ngừng bấm 500ms
    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id]);
    }
    debounceTimers.current[id] = setTimeout(() => {
      syncQuantityToServer(id, quantity);
      delete debounceTimers.current[id];
    }, 500);
  };

  const clearCart = () => {
    setCartItems([]);
    setTotalAmount(0);
  };

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
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