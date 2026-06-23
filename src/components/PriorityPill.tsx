// PriorityPill — small label rendering task priority with semantic colors.
//
// Kept tiny and presentational so it can be reused by TaskCard and the
// Details screen without bringing along state.

import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { TaskPriority } from "@/src/types/task";
import { colors, fonts, radius, spacing, typeScale } from "@/src/utils/theme";

interface PriorityPillProps {
  priority: TaskPriority;
}

const META: Record<
  TaskPriority,
  { label: string; bg: string; fg: string; border: string }
> = {
  low: {
    label: "Low",
    bg: "rgba(255,255,255,0.04)",
    fg: colors.onSurfaceSecondary,
    border: colors.border,
  },
  medium: {
    label: "Medium",
    bg: "rgba(212, 175, 55, 0.10)",
    fg: colors.onBrandTertiary,
    border: "rgba(212, 175, 55, 0.30)",
  },
  high: {
    label: "High",
    bg: "rgba(212, 175, 55, 0.22)",
    fg: colors.brandPrimary,
    border: "rgba(212, 175, 55, 0.55)",
  },
};

export const PriorityPill: React.FC<PriorityPillProps> = ({ priority }) => {
  const m = META[priority];
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: m.bg, borderColor: m.border },
      ]}
      testID={`priority-pill-${priority}`}
    >
      <Text style={[styles.label, { color: m.fg }]}>{m.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontFamily: fonts.text,
    fontSize: typeScale.xs,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
