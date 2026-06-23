// GlassCard — generic smoked-glass surface.
//
// Wraps expo-blur with a dark tint overlay and a hairline light border so it
// reads as a luxe glass tile on every background. Used by TaskCard, the
// sticky header and the AddTask sheet.

import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { colors, radius } from "@/src/utils/theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  borderRadius?: number;
  strong?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 30,
  borderRadius = radius.lg,
  strong = false,
}) => {
  return (
    <View
      style={[
        styles.container,
        { borderRadius },
        style,
      ]}
    >
      <BlurView
        tint="dark"
        intensity={intensity}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      {/* Dark scrim — keeps text contrast even when underlying background
          is light. Without this the blur alone won't guarantee readability. */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            backgroundColor: strong ? colors.glassTintStrong : colors.glassTint,
          },
        ]}
      />
      {/* Subtle hairline border for the smoked-glass edge highlight. */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: colors.border,
          },
        ]}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "transparent",
  },
});
