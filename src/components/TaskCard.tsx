// TaskCard — the bread and butter of the home list.
//
// Renders a single task on a smoked-glass surface with:
//   - left tap: navigate to Task Details
//   - left icon tap: toggle completed/pending
//   - swipe right-to-left: reveal a Delete action (gesture-handler Swipeable)
//
// We deliberately put the swipe action inside this file (not in TaskList)
// because swipeable rows need to know per-item context (id, callbacks).

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { GlassCard } from "@/src/components/GlassCard";
import { PriorityPill } from "@/src/components/PriorityPill";
import type { Task } from "@/src/types/task";
import { getCategory } from "@/src/utils/categories";
import { colors, fonts, radius, spacing, typeScale } from "@/src/utils/theme";

interface TaskCardProps {
  task: Task;
  index?: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onLongPress?: (task: Task) => void;
}

const formatDate = (iso?: string | null): string | null => {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index = 0,
  onToggle,
  onDelete,
  onLongPress,
}) => {
  const router = useRouter();
  const swipeRef = useRef<Swipeable>(null);
  const isDone = task.status === "completed";
  const dueLabel = formatDate(task.dueDate);
  const category = getCategory(task.category);

  // Animated checkbox: spring scale-bounce on tap. Uses Reanimated UI thread
  // so the animation never blocks on JS frames.
  const checkScale = useSharedValue(1);
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleToggle = () => {
    Haptics.notificationAsync(
      isDone
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success,
    ).catch(() => {});
    checkScale.value = withSequence(
      withTiming(0.7, { duration: 90 }),
      withSpring(1, { damping: 6, stiffness: 220 }),
    );
    onToggle(task.id);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    swipeRef.current?.close();
    onDelete(task.id);
  };

  // Right-side reveal action. Kept compact and matched to card height for
  // a refined feel — no garish full-bleed red.
  const renderRightActions = () => (
    <View style={styles.swipeActionWrap}>
      <RectButton
        onPress={handleDelete}
        style={styles.deleteAction}
        testID={`task-delete-${task.id}`}
      >
        <Ionicons name="trash-outline" size={22} color="#FFE4E4" />
        <Text style={styles.deleteLabel}>Delete</Text>
      </RectButton>
    </View>
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 60).springify().damping(14)}
    >
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
      rightThreshold={40}
    >
      <Pressable
        onPress={() => router.push(`/task/${task.id}`)}
        onLongPress={() => {
          if (onLongPress) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            onLongPress(task);
          }
        }}
        delayLongPress={350}
        testID={`task-card-${task.id}`}
        style={({ pressed }) => [pressed && { opacity: 0.85 }]}
      >
        <GlassCard style={styles.card}>
          {category ? (
            <View style={[styles.categoryStripe, { backgroundColor: category.color }]} />
          ) : null}
          <View style={styles.row}>
            {/* Checkbox / status toggle (spring-animated) */}
            <Pressable
              onPress={handleToggle}
              hitSlop={10}
              testID={`task-toggle-${task.id}`}
            >
              <Animated.View
                style={[
                  styles.checkbox,
                  isDone && styles.checkboxDone,
                  checkStyle,
                ]}
              >
                {isDone ? (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={colors.onBrandPrimary}
                  />
                ) : null}
              </Animated.View>
            </Pressable>

            <View style={styles.content}>
              <View style={styles.titleRow}>
                <Text
                  style={[styles.title, isDone && styles.titleDone]}
                  numberOfLines={1}
                >
                  {task.title}
                </Text>
                <PriorityPill priority={task.priority} />
              </View>

              {task.description ? (
                <Text style={styles.description} numberOfLines={2}>
                  {task.description}
                </Text>
              ) : null}

              <View style={styles.metaRow}>
                {category ? (
                  <View style={styles.metaItem}>
                    <View style={[styles.statusDot, { backgroundColor: category.color }]} />
                    <Text style={styles.metaText}>{category.label}</Text>
                  </View>
                ) : null}
                {dueLabel ? (
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color={colors.onSurfaceTertiary}
                    />
                    <Text style={styles.metaText}>{dueLabel}</Text>
                  </View>
                ) : null}
                <View style={styles.metaItem}>
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
                  <Text style={styles.metaText}>
                    {isDone ? "Completed" : "Pending"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </GlassCard>
      </Pressable>
    </Swipeable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryStripe: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkboxDone: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: fonts.text,
    fontSize: typeScale.lg,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  titleDone: {
    color: colors.onSurfaceTertiary,
    textDecorationLine: "line-through",
  },
  description: {
    color: colors.onSurfaceSecondary,
    fontFamily: fonts.text,
    fontSize: typeScale.base,
    marginTop: spacing.xs,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: colors.onSurfaceTertiary,
    fontFamily: fonts.text,
    fontSize: typeScale.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  swipeActionWrap: {
    width: 88,
    marginBottom: spacing.md,
    paddingLeft: spacing.sm,
  },
  deleteAction: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: "rgba(239, 68, 68, 0.18)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(239, 68, 68, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteLabel: {
    color: "#FFE4E4",
    fontFamily: fonts.text,
    fontSize: typeScale.sm,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
});
