// useTasks — owns ALL task state + persistence + derived views (filter / search /
// sort / category). Screens stay presentational and just consume.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  FilterStatus,
  NewTaskInput,
  SortKey,
  Task,
  TaskPriority,
  UpdateTaskInput,
} from "@/src/types/task";

const STORAGE_KEY = "@lumina/tasks/v1";

const makeId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  query: string;
  setQuery: (q: string) => void;
  filter: FilterStatus;
  setFilter: (f: FilterStatus) => void;
  category: string | null; // null = all categories
  setCategory: (c: string | null) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  visibleTasks: Task[];
  counts: { all: number; pending: number; completed: number };
  addTask: (input: NewTaskInput) => Promise<Task>;
  updateTask: (input: UpdateTaskInput) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
}

export const useTasks = (): UseTasksResult => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("created");

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Task[];
          if (Array.isArray(parsed)) setTasks(parsed);
        }
      } catch (err) {
        console.warn("[useTasks] failed to load", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: Task[]) => {
    setTasks(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.warn("[useTasks] failed to persist", err);
    }
  }, []);

  const addTask = useCallback(
    async (input: NewTaskInput): Promise<Task> => {
      const trimmed = input.title.trim();
      if (!trimmed) throw new Error("Task title cannot be empty.");
      const task: Task = {
        id: makeId(),
        title: trimmed,
        description: (input.description ?? "").trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
        dueDate: input.dueDate ?? null,
        priority: (input.priority as TaskPriority) ?? "medium",
        category: input.category ?? null,
      };
      await persist([task, ...tasks]);
      return task;
    },
    [tasks, persist],
  );

  const updateTask = useCallback(
    async (input: UpdateTaskInput) => {
      const trimmed = input.title.trim();
      if (!trimmed) throw new Error("Task title cannot be empty.");
      const next = tasks.map((t) =>
        t.id === input.id
          ? {
              ...t,
              title: trimmed,
              description: (input.description ?? "").trim(),
              priority: (input.priority as TaskPriority) ?? t.priority,
              dueDate: input.dueDate === undefined ? t.dueDate : input.dueDate,
              category:
                input.category === undefined ? t.category : input.category,
            }
          : t,
      );
      await persist(next);
    },
    [tasks, persist],
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const next = tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
          : t,
      ) as Task[];
      await persist(next);
    },
    [tasks, persist],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      await persist(tasks.filter((t) => t.id !== id));
    },
    [tasks, persist],
  );

  const getTaskById = useCallback(
    (id: string): Task | undefined => tasks.find((t) => t.id === id),
    [tasks],
  );

  const visibleTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = tasks.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (category && (t.category ?? null) !== category) return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q);
    });
    const sorted = [...filtered];
    switch (sort) {
      case "due":
        sorted.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        });
        break;
      case "priority":
        sorted.sort(
          (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
        );
        break;
      case "alpha":
        sorted.sort((a, b) =>
          a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
        );
        break;
      case "created":
      default:
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return sorted;
  }, [tasks, query, filter, category, sort]);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    }),
    [tasks],
  );

  return {
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
    visibleTasks,
    counts,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    getTaskById,
  };
};
