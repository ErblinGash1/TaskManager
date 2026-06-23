// Horizontal scrolling row of category chips. Tap to filter by category.
// "All" pill resets the filter.

import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CATEGORIES } from "@/src/utils/categories";
import { colors, fonts, radius, spacing, typeScale } from "@/src/utils/theme";

interface Props {
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export const CategoryChipRow: React.FC<Props> = ({ selected, onSelect }) => {
  const renderChip = (
    id: string | null,
    label: string,
    color?: string,
    fg?: string,
  ) => {
    const active = selected === id;
    return (
      <Pressable
        key={id ?? "all"}
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          onSelect(id);
        }}
        style={[
          styles.chip,
          { flexShrink: 0 },
          active && color
            ? { backgroundColor: color, borderColor: color }
            : active
              ? { backgroundColor: colors.onSurface, borderColor: colors.onSurface }
              : null,
        ]}
        testID={`category-chip-${id ?? "all"}`}
      >
        {color && !active ? (
          <View style={[styles.dot, { backgroundColor: color }]} />
        ) : null}
        <Text
          style={[
            styles.label,
            active
              ? { color: fg ?? "#0A0A0C", fontFamily: fonts.textBold }
              : null,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {renderChip(null, "All")}
      {CATEGORIES.map((c) => renderChip(c.id, c.label, c.color, c.fg))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { marginTop: spacing.md, marginHorizontal: -spacing.lg },
  row: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingVertical: 2,
  },
  chip: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: {
    color: colors.onSurfaceSecondary,
    fontFamily: fonts.textSemibold,
    fontSize: typeScale.sm,
    letterSpacing: 0.2,
  },
});
