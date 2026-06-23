// SearchBar + FilterTabs — slim, glanceable controls that sit above the list.
//
// Kept as a single component pair because they share a sticky header band on
// Home, and behave as a unit (search filters whatever the active tab returns).

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { FilterStatus } from "@/src/types/task";
import { colors, fonts, radius, spacing, typeScale } from "@/src/utils/theme";

interface SearchBarProps {
  value: string;
  onChange: (q: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <View style={styles.searchWrap} testID="search-bar">
      <Ionicons
        name="search"
        size={18}
        color={colors.onSurfaceTertiary}
        style={styles.searchIcon}
      />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search tasks…"
        placeholderTextColor={colors.onSurfaceTertiary}
        style={styles.searchInput}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        testID="search-input"
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChange("")}
          hitSlop={10}
          testID="search-clear-button"
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={colors.onSurfaceSecondary}
          />
        </Pressable>
      ) : null}
    </View>
  );
};

interface FilterTabsProps {
  value: FilterStatus;
  onChange: (f: FilterStatus) => void;
  counts: { all: number; pending: number; completed: number };
}

const TABS: { key: FilterStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

export const FilterTabs: React.FC<FilterTabsProps> = ({
  value,
  onChange,
  counts,
}) => {
  return (
    <View style={styles.tabsRow} testID="filter-tabs">
      {TABS.map((tab) => {
        const active = tab.key === value;
        return (
          <Pressable
            key={tab.key}
            onPress={() => {
              // Subtle selection haptic — feels expensive, not noisy.
              Haptics.selectionAsync().catch(() => {});
              onChange(tab.key);
            }}
            style={[styles.tab, active && styles.tabActive]}
            testID={`filter-tab-${tab.key}`}
          >
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            <View
              style={[styles.tabBadge, active && styles.tabBadgeActive]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  active && styles.tabBadgeTextActive,
                ]}
              >
                {counts[tab.key]}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    height: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: fonts.text,
    fontSize: typeScale.base,
    paddingVertical: 0,
  },
  tabsRow: {
    flexDirection: "row",
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    height: 38,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  tabLabel: {
    color: colors.onSurfaceSecondary,
    fontFamily: fonts.text,
    fontSize: typeScale.sm,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: colors.onBrandPrimary,
  },
  tabBadge: {
    minWidth: 22,
    height: 18,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  tabBadgeActive: {
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  tabBadgeText: {
    color: colors.onSurfaceSecondary,
    fontSize: 10,
    fontFamily: fonts.text,
    fontWeight: "700",
  },
  tabBadgeTextActive: {
    color: colors.onBrandPrimary,
  },
});
