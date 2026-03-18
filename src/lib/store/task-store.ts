import { create } from "zustand";

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  creatorId: string;
  creator: User;
  assigneeId: string | null;
  assignee: User | null;
  assigneeEmail: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getTasksByStatus: (status: TaskStatus) => Task[];
  getAssignedTasks: () => Task[];
  getCreatedTasks: () => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) =>
    set((state) => {
      // Avoid duplicates
      if (state.tasks.some((t) => t.id === task.id)) {
        return { tasks: state.tasks.map((t) => (t.id === task.id ? task : t)) };
      }
      return { tasks: [task, ...state.tasks] };
    }),

  updateTask: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    })),

  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  getTasksByStatus: (status) => {
    const state = get();
    return state.tasks.filter((task) => task.status === status);
  },

  getAssignedTasks: () => {
    const state = get();
    return state.tasks.filter(
      (task) => task.assigneeId !== null || task.assigneeEmail !== null
    );
  },

  getCreatedTasks: () => {
    const state = get();
    return state.tasks;
  },
}));
