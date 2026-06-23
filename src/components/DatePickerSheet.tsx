// DatePickerSheet — cross-platform custom calendar.
//
// Why we built our own: `@react-native-community/datetimepicker` does not
// render on react-native-web (the Expo preview). A bespoke pure-RN calendar
// works on iOS, Android AND web, matches our amber/gold glass aesthetic,
// and adds no native deps.
//
// Scope is intentionally minimal: pick a single day, with month navigation.

import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { colors, fonts, radius, spacing, typeScale } from "@/src/utils/theme";

interface DatePickerSheetProps {
  visible: boolean;
  initialDate: Date | null;
  onClose: () => void;
  onConfirm: (date: Date) => void;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

interface DayCell {
  day: number;
  inMonth: boolean;
  date: Date;
}

const buildCalendar = (year: number, month: number): DayCell[] => {
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = firstOfMonth.getDay(); // 0..6 (Sun..Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: DayCell[] = [];
  // Leading days from previous month so the grid starts on Sunday.
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    cells.push({
      day: d,
      inMonth: false,
      date: new Date(year, month - 1, d),
    });
  }
  // Current month days.
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true, date: new Date(year, month, d) });
  }
  // Trailing days to fill 6 rows × 7 cols = 42 cells.
  let trailing = 1;
  while (cells.length < 42) {
    cells.push({
      day: trailing,
      inMonth: false,
      date: new Date(year, month + 1, trailing),
    });
    trailing++;
  }
  return cells;
};

export const DatePickerSheet: React.FC<DatePickerSheetProps> = ({
  visible,
  initialDate,
  onClose,
  onConfirm,
}) => {
  const base = initialDate ?? new Date();
  const [cursor, setCursor] = useState<{ year: number; month: number }>({
    year: base.getFullYear(),
    month: base.getMonth(),
  });
  const [selected, setSelected] = useState<Date | null>(initialDate);

  // Re-seed state whenever the sheet (re-)opens so it reflects the latest
  // initialDate. We key off `visible` so the inner state stays stable while
  // open but always resets on next open.
  React.useEffect(() => {
    if (visible) {
      const d = initialDate ?? new Date();
      setCursor({ year: d.getFullYear(), month: d.getMonth() });
      setSelected(initialDate ?? null);
    }
  }, [visible, initialDate]);

  const cells = useMemo(
    () => buildCalendar(cursor.year, cursor.month),
    [cursor],
  );

  const today = new Date();

  const monthLabel = useMemo(
    () =>
      new Date(cursor.year, cursor.month, 1).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [cursor],
  );

  const stepMonth = (delta: number) => {
    Haptics.selectionAsync().catch(() => {});
    setCursor((c) => {
      const next = new Date(c.year, c.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.centerWrap} pointerEvents="box-none">
        <View style={styles.sheet} testID="date-picker-sheet">
          <BlurView
            tint="dark"
            intensity={60}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: colors.glassTintStrong },
            ]}
          />

          {/* Header: month + nav */}
          <View style={styles.header}>
            <Pressable
              onPress={() => stepMonth(-1)}
              hitSlop={10}
              style={styles.navBtn}
              testID="date-picker-prev"
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={colors.onSurface}
              />
            </Pressable>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <Pressable
              onPress={() => stepMonth(1)}
              hitSlop={10}
              style={styles.navBtn}
              testID="date-picker-next"
            >
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.onSurface}
              />
            </Pressable>
          </View>

          {/* Weekday header row */}
          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((w, i) => (
              <View key={i} style={styles.weekdayCell}>
                <Text style={styles.weekdayLabel}>{w}</Text>
              </View>
            ))}
          </View>

          {/* 6×7 day grid */}
          <View style={styles.grid}>
            {cells.map((cell, idx) => {
              const isSelected = selected
                ? isSameDay(selected, cell.date)
                : false;
              const isToday = isSameDay(today, cell.date);
              return (
                <Pressable
                  key={idx}
                  style={styles.dayCell}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSelected(cell.date);
                    // Snap cursor to the tapped month if user crossed boundary.
                    if (!cell.inMonth) {
                      setCursor({
                        year: cell.date.getFullYear(),
                        month: cell.date.getMonth(),
                      });
                    }
                  }}
                  testID={
                    cell.inMonth
                      ? `date-picker-day-${cell.day}`
                      : undefined
                  }
                >
                  <View
                    style={[
                      styles.dayInner,
                      isSelected && styles.dayInnerSelected,
                      isToday && !isSelected && styles.dayInnerToday,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !cell.inMonth && styles.dayTextMuted,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Footer actions */}
          <View style={styles.footer}>
            <Pressable
              onPress={onClose}
              style={[styles.footerBtn, styles.footerBtnGhost]}
              testID="date-picker-cancel"
            >
              <Text style={styles.footerBtnGhostLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={!selected}
              onPress={() => {
                if (!selected) return;
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                ).catch(() => {});
                onConfirm(selected);
              }}
              style={[
                styles.footerBtn,
                styles.footerBtnPrimary,
                !selected && { opacity: 0.5 },
              ]}
              testID="date-picker-confirm"
            >
              <Text style={styles.footerBtnPrimaryLabel}>
                {selected
                  ? `Set ${selected.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}`
                  : "Set date"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CELL = 38;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  centerWrap: {
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  monthLabel: {
    color: colors.onSurface,
    fontFamily: fonts.display,
    fontStyle: "italic",
    fontSize: typeScale.xl,
    fontWeight: "500",
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    height: 28,
    justifyContent: "center",
  },
  weekdayLabel: {
    color: colors.onSurfaceTertiary,
    fontFamily: fonts.text,
    fontSize: typeScale.xs,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: CELL + 6,
    alignItems: "center",
    justifyContent: "center",
  },
  dayInner: {
    width: CELL,
    height: CELL,
    borderRadius: CELL / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dayInnerToday: {
    borderWidth: 1,
    borderColor: colors.brandPrimary,
  },
  dayInnerSelected: {
    backgroundColor: colors.brandPrimary,
  },
  dayText: {
    color: colors.onSurface,
    fontFamily: fonts.text,
    fontSize: typeScale.base,
    fontWeight: "500",
  },
  dayTextMuted: {
    color: colors.onSurfaceTertiary,
  },
  dayTextSelected: {
    color: colors.onBrandPrimary,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  footerBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  footerBtnGhost: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  footerBtnGhostLabel: {
    color: colors.onSurfaceSecondary,
    fontFamily: fonts.text,
    fontWeight: "600",
    fontSize: typeScale.base,
  },
  footerBtnPrimary: {
    backgroundColor: colors.brandPrimary,
  },
  footerBtnPrimaryLabel: {
    color: colors.onBrandPrimary,
    fontFamily: fonts.text,
    fontWeight: "700",
    fontSize: typeScale.base,
    letterSpacing: 0.3,
  },
});
