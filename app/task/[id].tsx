// Task Details screen — cinematic deep-dive into a single task.
//
// Reads from the shared TasksContext so toggling completion here propagates
// back to the Home list immediately. Routed via expo-router file-based
// routing: /task/[id].

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddTaskModal } from "@/src/components/AddTaskModal";
import { GlassCard } from "@/src/components/GlassCard";
import { PriorityPill } from "@/src/components/PriorityPill";
import { useTasksContext } from "@/src/hooks/tasks-context";
import { getCategory } from "@/src/utils/categories";
import { colors, fonts, radius, spacing, typeScale } from "@/src/utils/theme";

const formatLong = (iso?: string | null): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export default function TaskDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTaskById, toggleTask, deleteTask, updateTask } = useTasksContext();
  const [showEdit, setShowEdit] = useState(false);

  // Memoise the lookup so we don't re-find on every render.
  const task = useMemo(() => (id ? getTaskById(id) : undefined), [
    id,
    getTaskById,
  ]);

  if (!task) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { marginTop: spacing.lg }]}
          testID="details-back-button"
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <View style={styles.missingWrap}>
          <Text style={styles.missingTitle}>Task not found</Text>
          <Text style={styles.missingSub}>
            It may have been deleted. Head back home to continue.
          </Text>
        </View>
      </View>
    );
  }

  const isDone = task.status === "completed";
  const category = getCategory(task.category);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Sticky header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          testID="details-back-button"
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Task</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {},
              );
              setShowEdit(true);
            }}
            style={styles.headerEditBtn}
            testID="details-edit-button"
            hitSlop={10}
          >
            <Ionicons name="create-outline" size={18} color={colors.onSurface} />
          </Pressable>
          <Pressable
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(
                () => {},
              );
              await deleteTask(task.id);
              router.back();
            }}
            style={styles.headerActionBtn}
            testID="details-delete-button"
            hitSlop={10}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.eyebrowRow}>
          <PriorityPill priority={task.priority} />
          {category ? (
            <View
              style={[
                styles.categoryChip,
                { backgroundColor: category.color, borderColor: category.color },
              ]}
            >
              <Text style={[styles.categoryChipLabel, { color: category.fg }]}>
                {category.label}
              </Text>
            </View>
          ) : null}
          <View style={styles.statusChip}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isDone
                    ? colors.success
                    : colors.brandPrimary,
                },
              ]}
            />
            <Text style={styles.statusChipLabel}>
              {isDone ? "Completed" : "Pending"}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.title, isDone && styles.titleDone]}
          testID="details-title"
        >
          {task.title}
        </Text>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.sectionBody} testID="details-description">
            {task.description?.length
              ? task.description
              : "No description added."}
          </Text>
        </GlassCard>

        <View style={styles.metaGrid}>
          <GlassCard style={styles.metaCell}>
            <Text style={styles.sectionLabel}>Due date</Text>
            <Text style={styles.metaValue} testID="details-due-date">
              {formatLong(task.dueDate)}
            </Text>
          </GlassCard>
          <GlassCard style={styles.metaCell}>
            <Text style={styles.sectionLabel}>Created</Text>
            <Text style={styles.metaValue}>{formatLong(task.createdAt)}</Text>
          </GlassCard>
        </View>

        <Pressable
          style={[
            styles.toggle,
            isDone ? styles.toggleReopen : styles.toggleComplete,
          ]}
          onPress={() => {
            Haptics.notificationAsync(
              isDone
                ? Haptics.NotificationFeedbackType.Warning
                : Haptics.NotificationFeedbackType.Success,
            ).catch(() => {});
            toggleTask(task.id);
          }}
          testID="details-toggle-button"
        >
          <Ionicons
            name={isDone ? "refresh" : "checkmark"}
            size={20}
            color={isDone ? colors.onSurface : colors.onBrandPrimary}
          />
          <Text
            style={[
              styles.toggleLabel,
              isDone
                ? { color: colors.onSurface }
                : { color: colors.onBrandPrimary },
            ]}
          >
            {isDone ? "Mark as Pending" : "Mark as Completed"}
          </Text>
        </Pressable>
      </ScrollView>

      <AddTaskModal
        visible={showEdit}
        initialTask={task}
        onClose={() => setShowEdit(false)}
        onSubmit={async (input) => {
          await updateTask({ id: task.id, ...input });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceTertiary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(239, 68, 68, 0.35)",
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  headerEditBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceTertiary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  categoryChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  categoryChipLabel: {
    fontFamily: fonts.textBold,
    fontSize: typeScale.xs,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  headerTitle: {
    color: colors.onSurfaceSecondary,
    fontFamily: fonts.text,
    fontSize: typeScale.sm,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  statusChipLabel: {
    color: colors.onSurfaceSecondary,
    fontFamily: fonts.text,
    fontSize: typeScale.xs,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  title: {
    color: colors.onSurface,
    fontFamily: fonts.display,
    fontSize: typeScale.display,
    lineHeight: 38,
    fontWeight: "500",
    fontStyle: "italic",
    letterSpacing: -0.3,
    marginBottom: spacing.xl,
  },
  titleDone: {
    color: colors.onSurfaceSecondary,
    textDecorationLine: "line-through",
  },
  section: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    color: colors.onSurfaceSecondary,
    fontFamily: fonts.text,
    fontSize: typeScale.xs,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  sectionBody: {
    color: colors.onSurface,
    fontFamily: fonts.text,
    fontSize: typeScale.lg,
    lineHeight: 24,
  },
  metaGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  metaCell: {
    flex: 1,
    padding: spacing.lg,
  },
  metaValue: {
    color: colors.onSurface,
    fontFamily: fonts.text,
    fontSize: typeScale.base,
    fontWeight: "500",
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 56,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  toggleComplete: {
    backgroundColor: colors.brandPrimary,
  },
  toggleReopen: {
    backgroundColor: colors.surfaceTertiary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  toggleLabel: {
    fontFamily: fonts.text,
    fontSize: typeScale.lg,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  missingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  missingTitle: {
    color: colors.onSurface,
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: typeScale.xxl,
    marginBottom: spacing.sm,
  },
  missingSub: {
    color: colors.onSurfaceSecondary,
    fontFamily: fonts.text,
    fontSize: typeScale.base,
    textAlign: "center",
  },
});
