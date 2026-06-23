// QuoteHero — premium hero card showing the Motivational Quote of the Day.
//
// Composes a dark amber-toned hero image with a top-to-bottom gradient scrim
// and editorial serif typography. Tap-to-refresh because users may want a new
// vibe on demand.

import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Quote } from "@/src/hooks/useQuote";
import { colors, fonts, radius, spacing, typeScale } from "@/src/utils/theme";

interface QuoteHeroProps {
  quote: Quote;
  loading: boolean;
  onRefresh: () => void;
}

const HERO_IMAGE =
  "https://images.pexels.com/photos/35990758/pexels-photo-35990758.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export const QuoteHero: React.FC<QuoteHeroProps> = ({
  quote,
  loading,
  onRefresh,
}) => {
  return (
    <Pressable
      onPress={onRefresh}
      testID="quote-hero"
      style={({ pressed }) => [
        styles.wrapper,
        pressed && { opacity: 0.92 },
      ]}
    >
      <Image
        source={{ uri: HERO_IMAGE }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={500}
        cachePolicy="memory-disk"
      />
      {/* Strong vertical gradient scrim — guarantees readability of the
          Fraunces-style serif headline against any photographic backdrop. */}
      <LinearGradient
        colors={[
          "rgba(10,10,12,0.25)",
          "rgba(10,10,12,0.78)",
          "rgba(10,10,12,0.96)",
        ]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Text style={styles.eyebrow}>QUOTE OF THE DAY</Text>
        <Text style={styles.quote} numberOfLines={4} testID="quote-text">
          {loading ? "…" : `"${quote.content}"`}
        </Text>
        <Text style={styles.author} testID="quote-author">
          — {quote.author}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 240,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "flex-end",
  },
  eyebrow: {
    fontFamily: fonts.text,
    fontSize: typeScale.xs,
    letterSpacing: 2,
    color: colors.brandPrimary,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  quote: {
    fontFamily: fonts.display,
    fontSize: typeScale.xl,
    lineHeight: 28,
    color: colors.onSurface,
    fontStyle: "italic",
    fontWeight: "500",
  },
  author: {
    fontFamily: fonts.text,
    fontSize: typeScale.base,
    color: colors.onSurfaceSecondary,
    marginTop: spacing.md,
    letterSpacing: 0.5,
  },
});
