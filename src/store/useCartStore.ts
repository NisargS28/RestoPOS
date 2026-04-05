import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  isActive: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  total: 0,
  addItem: (product) => {
    const currentItems = get().items;
    const existingItem = currentItems.find((item) => item.id === product.id);

    if (existingItem) {
      set({
        items: currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({ items: [...currentItems, { ...product, quantity: 1 }] });
    }
    
    const newTotal = get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    set({ total: newTotal });
  },
  removeItem: (productId) => {
    set({ items: get().items.filter((item) => item.id !== productId) });
    const newTotal = get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    set({ total: newTotal });
  },
  updateQuantity: (productId, quantity) => {
    set({
      items: get().items.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      ),
    });
    const newTotal = get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    set({ total: newTotal });
  },
  clearCart: () => set({ items: [], total: 0 }),
}));
