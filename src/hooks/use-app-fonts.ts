// Loads editorial Fraunces (display) + Inter (text) from fontsource CDN via
// expo-font. We mirror the pattern used by use-icon-fonts so the network
// request behaves the same on Expo Go.

import { useFonts } from "expo-font";

export const useAppFonts = (): readonly [boolean, Error | null] =>
  useFonts({
    "Fraunces-Italic":
      "https://cdn.jsdelivr.net/npm/@fontsource/fraunces@5.2.0/files/fraunces-latin-500-italic.ttf",
    "Inter-Regular":
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-400-normal.ttf",
    "Inter-Medium":
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-500-normal.ttf",
    "Inter-SemiBold":
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-600-normal.ttf",
    "Inter-Bold":
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-700-normal.ttf",
  });
