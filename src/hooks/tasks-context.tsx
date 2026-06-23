// TasksContext — hosts a single useTasks instance so Home and Task Details
// screens stay in sync. Otherwise each screen would call useTasks() and
// maintain its own copy, and mutations wouldn't propagate.

import React, { createContext, useContext } from "react";

import { useTasks } from "@/src/hooks/useTasks";

type TasksApi = ReturnType<typeof useTasks>;

const TasksContext = createContext<TasksApi | null>(null);

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const api = useTasks();
  return <TasksContext.Provider value={api}>{children}</TasksContext.Provider>;
};

export const useTasksContext = (): TasksApi => {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error("useTasksContext must be used inside <TasksProvider>");
  }
  return ctx;
};
