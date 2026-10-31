/**
 * Konteks produk favorit (client-side, localStorage).
 *
 * Daftar favorit dibaca dari localStorage memakai useSyncExternalStore
 * supaya hasil render di server dan di browser selalu sama (tanpa
 * hydration mismatch), sama seperti keranjang.
 */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

export interface FavoritItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  image: string;
}

interface FavoritContextType {
  items: FavoritItem[];
  isFavorite: (productId: string) => boolean;
  toggle: (product: FavoritItem) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
}

const FavoritContext = createContext<FavoritContextType | undefined>(undefined);

const STORAGE_KEY = "kwu_favorit_v1";
const EMPTY_ITEMS: FavoritItem[] = [];

/* ------------------------------------------------------------------ */
/* Penyimpanan luar (localStorage)                                      */
/* ------------------------------------------------------------------ */

let items: FavoritItem[] = EMPTY_ITEMS;
const listeners = new Set<() => void>();

function readStorage(): FavoritItem[] {
  if (typeof window === "undefined") return EMPTY_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_ITEMS;
    const parsed = JSON.parse(raw) as FavoritItem[];
    return Array.isArray(parsed) ? parsed : EMPTY_ITEMS;
  } catch {
    return EMPTY_ITEMS;
  }
}

function commit(next: FavoritItem[]) {
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

  // Saat pertama kali ada pendengar di browser, muat isi favorit.
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

function getSnapshot(): FavoritItem[] {
  return items;
}

function getServerSnapshot(): FavoritItem[] {
  return EMPTY_ITEMS;
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function FavoritProvider({ children }: { children: React.ReactNode }) {
  const favoritItems = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const isFavorite = useCallback(
    (productId: string) => favoritItems.some((i) => i.id === productId),
    [favoritItems]
  );

  const toggle = useCallback((product: FavoritItem) => {
    const sudahAda = items.some((i) => i.id === product.id);
    if (sudahAda) {
      commit(items.filter((i) => i.id !== product.id));
      return;
    }
    commit([...items, product]);
  }, []);

  const remove = useCallback((productId: string) => {
    commit(items.filter((i) => i.id !== productId));
  }, []);

  const clear = useCallback(() => {
    commit(EMPTY_ITEMS);
  }, []);

  const value = useMemo<FavoritContextType>(
    () => ({
      items: favoritItems,
      isFavorite,
      toggle,
      remove,
      clear,
      count: favoritItems.length,
    }),
    [favoritItems, isFavorite, toggle, remove, clear]
  );

  return (
    <FavoritContext.Provider value={value}>{children}</FavoritContext.Provider>
  );
}

export function useFavorit() {
  const ctx = useContext(FavoritContext);
  if (!ctx) throw new Error("useFavorit harus digunakan dalam FavoritProvider");
  return ctx;
}
