/**
 * Konteks keranjang belanja sederhana (client-side, localStorage).
 * Dalam implementasi penuh, keranjang disimpan di database terhubung auth.
 */
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

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

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = useCallback(
    (product: CartItem["product"], quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: Math.min(i.quantity + quantity, i.product.stock) }
              : i
          );
        }
        return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, quantity: Math.max(0, Math.min(quantity, i.product.stock)) }
          : i
      )
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus digunakan dalam CartProvider");
  return ctx;
}
