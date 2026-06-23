// Task domain model — extended for premium features:
//   - `category`: optional category id (see categories.ts)
//   - everything else unchanged for backwards compatibility with existing
//     AsyncStorage entries (missing fields default safely at read time).

export type TaskStatus = "completed" | "pending";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  dueDate?: string | null;
  priority: TaskPriority;
  category?: string | null; // id of a Category (see categories.ts)
}

export interface NewTaskInput {
  title: string;
  description?: string;
  dueDate?: string | null;
  priority?: TaskPriority;
  category?: string | null;
}

export interface UpdateTaskInput extends NewTaskInput {
  id: string;
}

export type FilterStatus = "all" | "pending" | "completed";

export type SortKey = "created" | "due" | "priority" | "alpha";
