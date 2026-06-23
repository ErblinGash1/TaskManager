// TaskContextMenu — opens on long-press from a TaskCard. Shows the task's
// title at the top and 3 inline actions: Toggle (complete/reopen), Edit, Delete.
// Mounted at the screen root so it overlays the FAB and tab bar (none here,
// but the pattern follows the codebase rule).

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

import type { Task } from "@/src/types/task";
import { colors, fonts, radius, spacing, typeScale } from "@/src/utils/theme";

interface Props {
  task: Task | null;
  onClose: () => void;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskContextMenu: React.FC<Props> = ({
  task,
  onClose,
  onToggle,
  onEdit,
  onDelete,
}) => {
  if (!task) return null;
  const isDone = task.status === "completed";

  const run = (fn: () => void, hapticStyle: Haptics.ImpactFeedbackStyle) => {
    Haptics.impactAsync(hapticStyle).catch(() => {});
    fn();
    onClose();
  };

  return (
    <Modal
      visible={!!task}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.center} pointerEvents="box-none">
        <View style={styles.sheet} testID="task-context-menu">
          <BlurView tint="dark" intensity={60} style={StyleSheet.absoluteFill} />
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: colors.glassTintStrong },
            ]}
          />

          <Text style={styles.eyebrow}>QUICK ACTIONS</Text>
          <Text style={styles.title} numberOfLines={2}>
            {task.title}
          </Text>

          <View style={styles.divider} />

          <Pressable
            style={styles.row}
            onPress={() =>
              run(() => onToggle(task.id), Haptics.ImpactFeedbackStyle.Light)
            }
            testID="context-menu-toggle"
          >
            <Ionicons
              name={isDone ? "refresh" : "checkmark-circle"}
              size={20}
              color={isDone ? colors.onSurface : colors.brandPrimary}
            />
            <Text style={styles.rowLabel}>
              {isDone ? "Mark as Pending" : "Mark as Completed"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.row}
            onPress={() =>
              run(() => onEdit(task), Haptics.ImpactFeedbackStyle.Light)
            }
            testID="context-menu-edit"
          >
            <Ionicons name="create-outline" size={20} color={colors.onSurface} />
            <Text style={styles.rowLabel}>Edit task</Text>
          </Pressable>

          <Pressable
            style={styles.row}
            onPress={() =>
              run(() => onDelete(task.id), Haptics.ImpactFeedbackStyle.Heavy)
            }
            testID="context-menu-delete"
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
            <Text style={[styles.rowLabel, { color: colors.error }]}>
              Delete task
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  sheet: {
    width: "100%",
    maxWidth: 360,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
  },
  eyebrow: {
    color: colors.brandPrimary,
    fontFamily: fonts.textBold,
    fontSize: typeScale.xs,
    letterSpacing: 2,
  },
  title: {
    color: colors.onSurface,
    fontFamily: fonts.display,
    fontSize: typeScale.xl,
    fontStyle: "italic",
    marginTop: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  rowLabel: {
    color: colors.onSurface,
    fontFamily: fonts.textMedium,
    fontSize: typeScale.base,
  },
});
