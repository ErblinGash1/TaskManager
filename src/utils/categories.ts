// Curated category registry. Colors stay within the warm/earthy palette so
// they never clash with the amber/gold brand accent.

export interface Category {
  id: string;
  label: string;
  color: string; // chip background / dot
  fg: string; // text color when used on the colored chip
}

export const CATEGORIES: Category[] = [
  { id: "work", label: "Work", color: "#D4AF37", fg: "#1A1500" },
  { id: "personal", label: "Personal", color: "#E5A6A1", fg: "#3D1F1C" },
  { id: "health", label: "Health", color: "#9CC3A8", fg: "#0D2A18" },
  { id: "errands", label: "Errands", color: "#C9B89F", fg: "#2D2418" },
  { id: "learning", label: "Learning", color: "#E0A06A", fg: "#3A1F0A" },
];

export const getCategory = (id?: string | null): Category | null => {
  if (!id) return null;
  return CATEGORIES.find((c) => c.id === id) ?? null;
};
