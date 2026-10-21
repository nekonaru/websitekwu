/**
 * Konteks keranjang belanja (client-side, localStorage).
 *
 * Isi keranjang dibaca dari localStorage memakai useSyncExternalStore
 * supaya hasil render di server dan di browser selalu sama.
 */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

export interface CartItem {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    image: string;
  };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: CartItem["product"], quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "kwu_cart_v1";
const EMPTY_ITEMS: CartItem[] = [];

/* ------------------------------------------------------------------ */
/* Penyimpanan luar (localStorage)                                      */
/* ------------------------------------------------------------------ */

let items: CartItem[] = EMPTY_ITEMS;
const listeners = new Set<() => void>();

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return EMPTY_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_ITEMS;
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : EMPTY_ITEMS;
  } catch {
    return EMPTY_ITEMS;
  }
}

function commit(next: CartItem[]) {
  items = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Penyimpanan penuh atau ditolak browser, abaikan saja.
    }
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  // Saat pertama kali ada pendengar di browser, muat isi keranjang.
  if (items === EMPTY_ITEMS) {
    const stored = readStorage();
    if (stored.length > 0) {
      items = stored;
    }
  }

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CartItem[] {
  return items;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_ITEMS;
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cartItems = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const addItem = useCallback(
    (product: CartItem["product"], quantity = 1) => {
      const existing = items.find((i) => i.product.id === product.id);
      if (existing) {
        commit(
          items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: Math.min(i.quantity + quantity, i.product.stock) }
              : i
          )
        );
        return;
      }
      commit([
        ...items,
        { product, quantity: Math.min(quantity, product.stock) },
      ]);
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    commit(items.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    commit(
      items.map((i) =>
        i.product.id === productId
          ? { ...i, quantity: Math.max(0, Math.min(quantity, i.product.stock)) }
          : i
      )
    );
  }, []);

  const clear = useCallback(() => {
    commit(EMPTY_ITEMS);
  }, []);

  const value = useMemo<CartContextType>(() => {
    const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = cartItems.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    );

    return {
      items: cartItems,
      addItem,
      removeItem,
      updateQuantity,
      clear,
      itemCount,
      subtotal,
    };
  }, [cartItems, addItem, removeItem, updateQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus digunakan dalam CartProvider");
  return ctx;
}
