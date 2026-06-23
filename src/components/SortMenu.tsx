// SortMenu — small bottom modal with 4 sort options. Premium glass tile.

import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import type { SortKey } from "@/src/types/task";
import { colors, fonts, radius, spacing, typeScale } from "@/src/utils/theme";

const OPTIONS: { key: SortKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "created", label: "Date created (newest)", icon: "time-outline" },
  { key: "due", label: "Due date (soonest)", icon: "calendar-outline" },
  { key: "priority", label: "Priority (high → low)", icon: "flame-outline" },
  { key: "alpha", label: "Alphabetical (A–Z)", icon: "text-outline" },
];

interface Props {
  visible: boolean;
  value: SortKey;
  onClose: () => void;
  onChange: (k: SortKey) => void;
}

export const SortMenu: React.FC<Props> = ({ visible, value, onClose, onChange }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.center} pointerEvents="box-none">
        <View style={styles.sheet} testID="sort-menu">
          <BlurView tint="dark" intensity={60} style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassTintStrong }]} />
          <Text style={styles.heading}>Sort by</Text>
          {OPTIONS.map((o) => {
            const active = o.key === value;
            return (
              <Pressable
                key={o.key}
                style={[styles.row, active && styles.rowActive]}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  onChange(o.key);
                  onClose();
                }}
                testID={`sort-option-${o.key}`}
              >
                <Ionicons name={o.icon} size={18} color={active ? colors.brandPrimary : colors.onSurfaceSecondary} />
                <Text style={[styles.label, active && { color: colors.onSurface, fontFamily: fonts.textSemibold }]}>{o.label}</Text>
                {active ? <Ionicons name="checkmark" size={18} color={colors.brandPrimary} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
  sheet: {
    width: "100%",
    maxWidth: 360,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
  },
  heading: {
    color: colors.onSurface,
    fontFamily: fonts.display,
    fontSize: typeScale.xl,
    fontStyle: "italic",
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  rowActive: { backgroundColor: "rgba(212,175,55,0.08)" },
  label: { flex: 1, color: colors.onSurfaceSecondary, fontFamily: fonts.text, fontSize: typeScale.base },
});
