// EmptyState — shared placeholder for "no tasks yet" and "no search results".
//
// We accept the headline / sub-copy as props so the same composition serves
// both flows. The illustration is an expo-image fade-in for a polished feel.

import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radius, spacing, typeScale } from "@/src/utils/theme";

interface EmptyStateProps {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  testID?: string;
}

const ART_URI =
  "https://images.pexels.com/photos/7827838/pexels-photo-7827838.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  ctaLabel,
  onCtaPress,
  testID,
}) => {
  return (
    <View style={styles.wrap} testID={testID ?? "empty-state"}>
      <View style={styles.artWrap}>
        <Image
          source={{ uri: ART_URI }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={400}
        />
        <View style={styles.artScrim} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {ctaLabel && onCtaPress ? (
        <Pressable
          onPress={onCtaPress}
          style={styles.cta}
          testID="empty-state-cta"
        >
          <Text style={styles.ctaLabel}>{ctaLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  artWrap: {
    width: 160,
    height: 160,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  artScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,12,0.45)",
  },
  title: {
    color: colors.onSurface,
    fontFamily: fonts.display,
    fontSize: typeScale.xxl,
    fontWeight: "500",
    fontStyle: "italic",
    textAlign: "center",
  },
  subtitle: {
    color: colors.onSurfaceSecondary,
    fontFamily: fonts.text,
    fontSize: typeScale.base,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 20,
    maxWidth: 280,
  },
  cta: {
    marginTop: spacing.xl,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  ctaLabel: {
    color: colors.onBrandPrimary,
    fontFamily: fonts.text,
    fontSize: typeScale.base,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
