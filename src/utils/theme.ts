// Centralised design tokens — mirrors design_guidelines.json.
//
// WHY a single theme module instead of inline literals: when the design language
// shifts (e.g. switching accent or radius scale), one edit propagates app-wide.
// Components must NEVER hardcode colours / spacing.

export const colors = {
  // Surfaces (dark, layered)
  surface: "#0A0A0C",
  onSurface: "#F4F4F5",
  surfaceSecondary: "#121215",
  onSurfaceSecondary: "#A1A1AA",
  surfaceTertiary: "#1A1A1E",
  onSurfaceTertiary: "#71717A",

  // Amber/gold brand — the only accent allowed in the app.
  brand: "#D4AF37",
  brandPrimary: "#D4AF37",
  onBrandPrimary: "#1A1500",
  brandSecondary: "#B59329",
  brandTertiary: "rgba(212, 175, 55, 0.12)",
  onBrandTertiary: "#E5C560",

  // Semantic states
  success: "#34D399",
  warning: "#FBBF24",
  error: "#EF4444",

  // Borders & dividers (subtle light strokes for the smoked-glass edge).
  border: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.16)",
  divider: "rgba(255, 255, 255, 0.04)",

  // Glass tints used by expo-blur overlays.
  glassTint: "rgba(18, 18, 21, 0.6)",
  glassTintStrong: "rgba(10, 10, 12, 0.75)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};

// Editorial display family + premium text family loaded from a CDN via
// expo-font (see use-app-fonts.ts). We retain platform fallbacks in case the
// CDN fetch fails — the app still ships with a refined look.
export const fonts = {
  display: "Fraunces-Italic",
  text: "Inter-Regular",
  textMedium: "Inter-Medium",
  textSemibold: "Inter-SemiBold",
  textBold: "Inter-Bold",
};

export const typeScale = {
  xs: 11,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  display: 32,
};
