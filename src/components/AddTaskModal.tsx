// AddTaskModal — slide-up sheet for creating OR editing a task.
//
// The same composition is used in both modes; pass `initialTask` to switch the
// modal into edit mode. We keep validation, haptics and animation behaviour
// identical for both flows.

import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  Keyboard,
} from "react-native";

import { DatePickerSheet } from "@/src/components/DatePickerSheet";
import type { NewTaskInput, Task, TaskPriority } from "@/src/types/task";
import { CATEGORIES } from "@/src/utils/categories";
import { colors, fonts, radius, spacing, typeScale } from "@/src/utils/theme";

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: NewTaskInput) => Promise<void>;
  initialTask?: Task | null; // when present, modal is in edit mode
}

const PRIORITIES: { key: TaskPriority; label: string }[] = [
  { key: "low", label: "Low" },
  { key: "medium", label: "Medium" },
  { key: "high", label: "High" },
];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialTask = null,
}) => {
  const isEdit = !!initialTask;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const translateY = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible) {
      // Reset / seed form whenever the sheet opens.
      setTitle(initialTask?.title ?? "");
      setDescription(initialTask?.description ?? "");
      setPriority(initialTask?.priority ?? "medium");
      setDueDate(initialTask?.dueDate ? new Date(initialTask.dueDate) : null);
      setCategory(initialTask?.category ?? null);
      setError(null);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else {
      translateY.setValue(600);
    }
  }, [visible, initialTask, translateY]);

  const dismiss = () => {
    Keyboard.dismiss();
    Animated.timing(translateY, {
      toValue: 700,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title can't be empty.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {},
      );
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit({
        title,
        description,
        priority,
        dueDate: dueDate ? dueDate.toISOString() : null,
        category,
      });
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
      dismiss();
    } catch (e) {
      setError((e as Error).message || "Failed to save task.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismiss}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={dismiss}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.kav}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY }] }]}
          testID="add-task-modal"
        >
          <BlurView tint="dark" intensity={50} style={StyleSheet.absoluteFill} />
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: colors.glassTintStrong },
            ]}
          />

          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerRow}>
              <Text style={styles.heading}>{isEdit ? "Edit Task" : "New Task"}</Text>
              <Pressable
                onPress={dismiss}
                hitSlop={10}
                testID="add-task-close-button"
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={colors.onSurfaceSecondary}
                />
              </Pressable>
            </View>

            <Text style={styles.label}>Title</Text>
            <TextInput
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (error) setError(null);
              }}
              placeholder="e.g. Draft Q3 strategy memo"
              placeholderTextColor={colors.onSurfaceTertiary}
              style={[styles.input, error ? styles.inputError : null]}
              testID="add-task-title-input"
              autoFocus={!isEdit}
            />
            {error ? (
              <Text style={styles.errorText} testID="add-task-error">
                {error}
              </Text>
            ) : null}

            <Text style={styles.label}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Optional details…"
              placeholderTextColor={colors.onSurfaceTertiary}
              style={[styles.input, styles.inputMultiline]}
              multiline
              testID="add-task-description-input"
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.catRow}>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setCategory(null);
                }}
                style={[
                  styles.catChip,
                  category === null && styles.catChipNoneActive,
                ]}
                testID="add-task-category-none"
              >
                <Text
                  style={[
                    styles.catChipLabel,
                    category === null && { color: colors.onSurface, fontFamily: fonts.textBold },
                  ]}
                >
                  None
                </Text>
              </Pressable>
              {CATEGORIES.map((c) => {
                const active = category === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setCategory(c.id);
                    }}
                    style={[
                      styles.catChip,
                      active && { backgroundColor: c.color, borderColor: c.color },
                    ]}
                    testID={`add-task-category-${c.id}`}
                  >
                    {!active ? (
                      <View style={[styles.catDot, { backgroundColor: c.color }]} />
                    ) : null}
                    <Text
                      style={[
                        styles.catChipLabel,
                        active && { color: c.fg, fontFamily: fonts.textBold },
                      ]}
                    >
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Priority</Text>
            <View style={styles.segmentRow}>
              {PRIORITIES.map((p) => {
                const active = p.key === priority;
                return (
                  <Pressable
                    key={p.key}
                    style={[styles.segment, active && styles.segmentActive]}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setPriority(p.key);
                    }}
                    testID={`add-task-priority-${p.key}`}
                  >
                    <Text
                      style={[
                        styles.segmentLabel,
                        active && styles.segmentLabelActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Due date</Text>
            <Pressable
              style={styles.dateRow}
              onPress={() => setShowPicker(true)}
              testID="add-task-duedate-button"
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={colors.onSurfaceSecondary}
              />
              <Text style={styles.dateLabel}>
                {dueDate
                  ? dueDate.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Choose a date (optional)"}
              </Text>
              {dueDate ? (
                <Pressable
                  onPress={() => setDueDate(null)}
                  hitSlop={10}
                  testID="add-task-duedate-clear"
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={colors.onSurfaceTertiary}
                  />
                </Pressable>
              ) : null}
            </Pressable>

            {showPicker ? (
              <DatePickerSheet
                visible={showPicker}
                initialDate={dueDate}
                onClose={() => setShowPicker(false)}
                onConfirm={(d) => {
                  setDueDate(d);
                  setShowPicker(false);
                }}
              />
            ) : null}

            <Pressable
              style={[styles.submit, submitting && { opacity: 0.7 }]}
              disabled={submitting}
              onPress={handleSubmit}
              testID="add-task-submit-button"
            >
              <Text style={styles.submitLabel}>
                {submitting ? "Saving…" : isEdit ? "Save Changes" : "Add Task"}
              </Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  kav: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    maxHeight: "92%",
    borderTopLeftRadius: radius.lg + 4,
    borderTopRightRadius: radius.lg + 4,
    overflow: "hidden",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  handleWrap: { alignItems: "center", paddingTop: spacing.md, paddingBottom: spacing.xs },
  handle: { width: 44, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.18)" },
  scrollContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  heading: {
    color: colors.onSurface,
    fontFamily: fonts.display,
    fontSize: typeScale.xxl,
    fontStyle: "italic",
  },
  label: {
    color: colors.onSurfaceSecondary,
    fontFamily: fonts.textSemibold,
    fontSize: typeScale.sm,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceTertiary,
    color: colors.onSurface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontFamily: fonts.text,
    fontSize: typeScale.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  inputMultiline: { minHeight: 96, textAlignVertical: "top", paddingTop: 14 },
  inputError: { borderColor: colors.error },
  errorText: {
    color: colors.error,
    fontFamily: fonts.text,
    fontSize: typeScale.sm,
    marginTop: spacing.xs,
  },
  catRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  catChipNoneActive: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: colors.borderStrong,
  },
  catChipLabel: {
    color: colors.onSurfaceSecondary,
    fontFamily: fonts.textSemibold,
    fontSize: typeScale.sm,
  },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  segmentRow: { flexDirection: "row", gap: spacing.sm },
  segment: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceTertiary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  segmentActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  segmentLabel: {
    color: colors.onSurfaceSecondary,
    fontFamily: fonts.textSemibold,
    fontSize: typeScale.base,
  },
  segmentLabelActive: { color: colors.onBrandPrimary, fontFamily: fonts.textBold },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  dateLabel: { flex: 1, color: colors.onSurface, fontFamily: fonts.text, fontSize: typeScale.base },
  submit: {
    marginTop: spacing.xxl,
    backgroundColor: colors.brandPrimary,
    height: 52,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  submitLabel: {
    color: colors.onBrandPrimary,
    fontFamily: fonts.textBold,
    fontSize: typeScale.lg,
    letterSpacing: 0.5,
  },
});
