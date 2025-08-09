import { create } from "zustand";
import { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  locale: string;
  home_country: string | null;
}

interface AppState {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  userProfile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// カート関連の状態管理
interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  selected_offer_id: string | null;
  note: string | null;
  product?: {
    title: string;
    brand: string | null;
    cover_image_url: string | null;
    weight_g: number | null;
  };
  offer?: {
    price_jpy: number | null;
    shop?: {
      name: string;
    };
  };
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  setItems: (items) => set({ items }),
  addItem: (item) => {
    const { items } = get();
    const existingItem = items.find((i) => i.product_id === item.product_id);

    if (existingItem) {
      set({
        items: items.map((i) =>
          i.id === existingItem.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
      });
    } else {
      set({ items: [...items, item] });
    }
  },
  updateItemQuantity: (id, quantity) => {
    const { items } = get();
    set({
      items: items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    });
  },
  removeItem: (id) => {
    const { items } = get();
    set({ items: items.filter((item) => item.id !== id) });
  },
  clearCart: () => set({ items: [] }),
  setLoading: (isLoading) => set({ isLoading }),
}));
