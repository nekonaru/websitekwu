/**
 * Design tokens KWU.
 * Semua warna, spacing, radius, dan breakpoint dikelola di satu tempat
 * agar konsisten di seluruh antarmuka (orange, biru, putih).
 */

export const designTokens = {
  // Warna utama KWU (hex)
  colors: {
    orange: {
      50: "#FFF7ED",
      100: "#FFEDD5",
      500: "#F97316",
      600: "#EA580C",
      900: "#7C2D12",
    },
    blue: {
      50: "#EFF6FF",
      100: "#DBEAFE",
      500: "#3B82F6",
      600: "#2563EB",
      900: "#1E3A8A",
    },
    neutral: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      600: "#4B5563",
      900: "#111827",
    },
  },
  // Breakpoint (mobile-first)
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
  // Ukuran target sentuh minimum (aksesibilitas)
  touchTarget: "44px",
} as const;

export type DesignTokenColors = typeof designTokens.colors;
