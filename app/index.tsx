// Home screen — composes the Quote hero, sticky search/filter band, task list
// and the floating "Add Task" CTA.
//
// All business logic comes from `useTasksContext` (a single shared store).
// The screen itself stays presentational.

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddTaskModal } from "@/src/components/AddTaskModal";
import { CategoryChipRow } from "@/src/components/CategoryChipRow";
import { EmptyState } from "@/src/components/EmptyState";
import { QuoteHero } from "@/src/components/QuoteHero";
import {
  FilterTabs,
  SearchBar,
} from "@/src/components/SearchAndFilters";
import { SortMenu } from "@/src/components/SortMenu";
import { SparkBurst } from "@/src/components/SparkBurst";
import { TaskCard } from "@/src/components/TaskCard";
import { TaskContextMenu } from "@/src/components/TaskContextMenu";
import type { Task } from "@/src/types/task";
import { useQuote } from "@/src/hooks/useQuote";
import { useTasksContext } from "@/src/hooks/tasks-context";
import { colors, fonts, radius, spacing, typeScale } from "@/src/utils/theme";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    visibleTasks,
    tasks,
    loading,
    query,
    setQuery,
    filter,
    setFilter,
    category,
    setCategory,
    sort,
    setSort,
    counts,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
  } = useTasksContext();
  const { quote, loading: quoteLoading, refresh } = useQuote();

  const [showAdd, setShowAdd] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [contextTask, setContextTask] = useState<Task | null>(null);

  // Spark burst: nonce increments on the false→true transition of
  // "every task is completed". We track `prevAllDone` in a ref so we don't
  // re-fire on every render where the state is already done.
  const [sparkNonce, setSparkNonce] = useState(0);
  const prevAllDone = useRef(false);
  useEffect(() => {
    const allDone =
      tasks.length > 0 && counts.completed === tasks.length;
    if (allDone && !prevAllDone.current) {
      setSparkNonce((n) => n + 1);
    }
    prevAllDone.current = allDone;
  }, [tasks.length, counts.completed]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Distinguish two empty states: zero tasks at all vs. zero search results.
  const renderEmpty = () => {
    if (tasks.length === 0) {
      return (
        <EmptyState
          testID="empty-state-no-tasks"
          title="A blank slate"
          subtitle="Your day, beautifully organised. Add your first task to get started."
          ctaLabel="Add Task"
          onCtaPress={() => setShowAdd(true)}
        />
      );
    }
    return (
      <EmptyState
        testID="empty-state-no-results"
        title="Nothing matches"
        subtitle="Try a different keyword or switch the filter tab above."
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={visibleTasks}
        keyExtractor={(t) => t.id}
        renderItem={({ item, index }) => (
          <TaskCard
            task={item}
            index={index}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onLongPress={(t) => setContextTask(t)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 120 },
          visibleTasks.length === 0 && { flexGrow: 1 },
        ]}
        ListHeaderComponent={
          <View>
            {/* Top greeting band */}
            <View style={styles.topBand}>
              <View>
                <Text style={styles.brand}>Lumina</Text>
                <Text style={styles.brandSub}>Your day, beautifully kept.</Text>
              </View>
            </View>

            <QuoteHero
              quote={quote}
              loading={quoteLoading}
              onRefresh={refresh}
            />

            {/* Sticky-feeling header band (technically inside header — we render
                it once and the FlatList scrolls it with the list, which feels
                fine on a short list and avoids the sticky-overlap pitfalls). */}
            <View style={styles.headerBand}>
              <SearchBar value={query} onChange={setQuery} />
              <FilterTabs
                value={filter}
                onChange={setFilter}
                counts={counts}
              />
              <CategoryChipRow selected={category} onSelect={setCategory} />
              <View style={styles.sortRow}>
                <Text style={styles.sortHint}>
                  {visibleTasks.length} {visibleTasks.length === 1 ? "task" : "tasks"}
                </Text>
                <Pressable
                  onPress={() => setShowSort(true)}
                  style={styles.sortBtn}
                  testID="sort-button"
                  hitSlop={8}
                >
                  <Ionicons name="swap-vertical" size={14} color={colors.onSurfaceSecondary} />
                  <Text style={styles.sortBtnLabel}>Sort</Text>
                </Pressable>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.brandPrimary} />
            </View>
          ) : (
            renderEmpty()
          )
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brandPrimary}
            colors={[colors.brandPrimary]}
            progressBackgroundColor={colors.surfaceTertiary}
          />
        }
      />

      {/* Floating Add Task button */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
            () => {},
          );
          setShowAdd(true);
        }}
        style={[
          styles.fab,
          { bottom: Math.max(insets.bottom, spacing.lg) + spacing.lg },
        ]}
        testID="add-task-fab"
      >
        <Ionicons name="add" size={28} color={colors.onBrandPrimary} />
      </Pressable>

      <AddTaskModal
        visible={showAdd || !!editingTask}
        initialTask={editingTask}
        onClose={() => {
          setShowAdd(false);
          setEditingTask(null);
        }}
        onSubmit={async (input) => {
          if (editingTask) {
            await updateTask({ id: editingTask.id, ...input });
          } else {
            await addTask(input);
          }
        }}
      />

      <SortMenu
        visible={showSort}
        value={sort}
        onClose={() => setShowSort(false)}
        onChange={setSort}
      />

      <TaskContextMenu
        task={contextTask}
        onClose={() => setContextTask(null)}
        onToggle={toggleTask}
        onEdit={(t) => setEditingTask(t)}
        onDelete={deleteTask}
      />

      <SparkBurst nonce={sparkNonce} onDismiss={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  topBand: {
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.lg,
  },
  brand: {
    color: colors.onSurface,
    fontFamily: fonts.display,
    fontSize: typeScale.display,
    fontWeight: "500",
    fontStyle: "italic",
    letterSpacing: -0.5,
  },
  brandSub: {
    color: colors.onSurfaceSecondary,
    fontFamily: fonts.text,
    fontSize: typeScale.base,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  headerBand: {
    marginBottom: spacing.lg,
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  sortHint: {
    color: colors.onSurfaceTertiary,
    fontFamily: fonts.text,
    fontSize: typeScale.sm,
    letterSpacing: 0.4,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  sortBtnLabel: {
    color: colors.onSurfaceSecondary,
    fontFamily: fonts.textSemibold,
    fontSize: typeScale.sm,
    letterSpacing: 0.2,
  },
  loadingWrap: {
    paddingTop: spacing.xxxl,
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
