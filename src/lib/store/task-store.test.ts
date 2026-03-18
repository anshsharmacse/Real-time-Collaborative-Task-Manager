import { describe, test, expect, beforeEach } from "bun:test";
import { useTaskStore, Task, TaskStatus, TaskPriority } from "./task-store";

describe("TaskStore", () => {
  // Reset store before each test
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [],
      isLoading: false,
      error: null,
    });
  });

  // Sample task factory
  const createMockTask = (overrides: Partial<Task> = {}): Task => ({
    id: "task-1",
    title: "Test Task",
    description: "Test description",
    status: "PENDING" as TaskStatus,
    priority: "MEDIUM" as TaskPriority,
    dueDate: null,
    creatorId: "user-1",
    creator: {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      image: null,
    },
    assigneeId: null,
    assignee: null,
    assigneeEmail: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    ...overrides,
  });

  describe("setTasks", () => {
    test("should set tasks in the store", () => {
      const tasks = [
        createMockTask({ id: "task-1" }),
        createMockTask({ id: "task-2", title: "Second Task" }),
      ];

      useTaskStore.getState().setTasks(tasks);

      expect(useTaskStore.getState().tasks).toHaveLength(2);
      expect(useTaskStore.getState().tasks[0].id).toBe("task-1");
      expect(useTaskStore.getState().tasks[1].id).toBe("task-2");
    });

    test("should replace existing tasks", () => {
      useTaskStore.getState().setTasks([createMockTask({ id: "old-task" })]);
      useTaskStore.getState().setTasks([createMockTask({ id: "new-task" })]);

      expect(useTaskStore.getState().tasks).toHaveLength(1);
      expect(useTaskStore.getState().tasks[0].id).toBe("new-task");
    });
  });

  describe("addTask", () => {
    test("should add a new task to the beginning of the list", () => {
      const existingTask = createMockTask({ id: "existing" });
      useTaskStore.getState().setTasks([existingTask]);

      const newTask = createMockTask({ id: "new" });
      useTaskStore.getState().addTask(newTask);

      expect(useTaskStore.getState().tasks).toHaveLength(2);
      expect(useTaskStore.getState().tasks[0].id).toBe("new");
    });

    test("should update existing task if ID matches", () => {
      const task = createMockTask({ id: "task-1", title: "Original" });
      useTaskStore.getState().setTasks([task]);

      const updatedTask = createMockTask({ id: "task-1", title: "Updated" });
      useTaskStore.getState().addTask(updatedTask);

      expect(useTaskStore.getState().tasks).toHaveLength(1);
      expect(useTaskStore.getState().tasks[0].title).toBe("Updated");
    });
  });

  describe("updateTask", () => {
    test("should update an existing task", () => {
      const task = createMockTask({ id: "task-1", status: "PENDING" });
      useTaskStore.getState().setTasks([task]);

      const updatedTask = createMockTask({ id: "task-1", status: "COMPLETED" });
      useTaskStore.getState().updateTask(updatedTask);

      expect(useTaskStore.getState().tasks[0].status).toBe("COMPLETED");
    });

    test("should not modify other tasks", () => {
      const task1 = createMockTask({ id: "task-1", title: "Task 1" });
      const task2 = createMockTask({ id: "task-2", title: "Task 2" });
      useTaskStore.getState().setTasks([task1, task2]);

      const updatedTask1 = createMockTask({ id: "task-1", title: "Updated Task 1" });
      useTaskStore.getState().updateTask(updatedTask1);

      expect(useTaskStore.getState().tasks[0].title).toBe("Updated Task 1");
      expect(useTaskStore.getState().tasks[1].title).toBe("Task 2");
    });
  });

  describe("removeTask", () => {
    test("should remove a task by ID", () => {
      const task1 = createMockTask({ id: "task-1" });
      const task2 = createMockTask({ id: "task-2" });
      useTaskStore.getState().setTasks([task1, task2]);

      useTaskStore.getState().removeTask("task-1");

      expect(useTaskStore.getState().tasks).toHaveLength(1);
      expect(useTaskStore.getState().tasks[0].id).toBe("task-2");
    });

    test("should not throw if task does not exist", () => {
      const task = createMockTask({ id: "task-1" });
      useTaskStore.getState().setTasks([task]);

      expect(() => useTaskStore.getState().removeTask("non-existent")).not.toThrow();
      expect(useTaskStore.getState().tasks).toHaveLength(1);
    });
  });

  describe("setLoading", () => {
    test("should set loading state", () => {
      useTaskStore.getState().setLoading(true);
      expect(useTaskStore.getState().isLoading).toBe(true);

      useTaskStore.getState().setLoading(false);
      expect(useTaskStore.getState().isLoading).toBe(false);
    });
  });

  describe("setError", () => {
    test("should set error state", () => {
      useTaskStore.getState().setError("Something went wrong");
      expect(useTaskStore.getState().error).toBe("Something went wrong");

      useTaskStore.getState().setError(null);
      expect(useTaskStore.getState().error).toBeNull();
    });
  });

  describe("getTasksByStatus", () => {
    test("should filter tasks by status", () => {
      const pendingTask = createMockTask({ id: "pending", status: "PENDING" });
      const inProgressTask = createMockTask({ id: "in-progress", status: "IN_PROGRESS" });
      const completedTask = createMockTask({ id: "completed", status: "COMPLETED" });
      useTaskStore.getState().setTasks([pendingTask, inProgressTask, completedTask]);

      const pending = useTaskStore.getState().getTasksByStatus("PENDING");
      const inProgress = useTaskStore.getState().getTasksByStatus("IN_PROGRESS");
      const completed = useTaskStore.getState().getTasksByStatus("COMPLETED");

      expect(pending).toHaveLength(1);
      expect(pending[0].id).toBe("pending");
      expect(inProgress).toHaveLength(1);
      expect(inProgress[0].id).toBe("in-progress");
      expect(completed).toHaveLength(1);
      expect(completed[0].id).toBe("completed");
    });
  });

  describe("getAssignedTasks", () => {
    test("should return tasks with assignee", () => {
      const unassignedTask = createMockTask({ id: "unassigned" });
      const assignedTask = createMockTask({
        id: "assigned",
        assigneeId: "user-2",
        assignee: {
          id: "user-2",
          name: "Assignee",
          email: "assignee@example.com",
          image: null,
        },
      });
      const emailAssignedTask = createMockTask({
        id: "email-assigned",
        assigneeEmail: "pending@example.com",
      });
      useTaskStore.getState().setTasks([unassignedTask, assignedTask, emailAssignedTask]);

      const assigned = useTaskStore.getState().getAssignedTasks();

      expect(assigned).toHaveLength(2);
      expect(assigned.map((t) => t.id)).toContain("assigned");
      expect(assigned.map((t) => t.id)).toContain("email-assigned");
    });
  });

  describe("Task Priority and Status Transitions", () => {
    test("should handle all priority levels", () => {
      const priorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];
      
      // Use setTasks to maintain order
      const tasks = priorities.map((priority, index) => 
        createMockTask({ id: `task-${index}`, priority })
      );
      useTaskStore.getState().setTasks(tasks);

      expect(useTaskStore.getState().tasks).toHaveLength(3);
      expect(useTaskStore.getState().tasks[0].priority).toBe("LOW");
      expect(useTaskStore.getState().tasks[1].priority).toBe("MEDIUM");
      expect(useTaskStore.getState().tasks[2].priority).toBe("HIGH");
    });

    test("should handle all status values", () => {
      const statuses: TaskStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED"];
      
      // Use setTasks to maintain order
      const tasks = statuses.map((status, index) => 
        createMockTask({ id: `task-${index}`, status })
      );
      useTaskStore.getState().setTasks(tasks);

      expect(useTaskStore.getState().tasks).toHaveLength(3);
      
      const pending = useTaskStore.getState().getTasksByStatus("PENDING");
      const inProgress = useTaskStore.getState().getTasksByStatus("IN_PROGRESS");
      const completed = useTaskStore.getState().getTasksByStatus("COMPLETED");
      
      expect(pending).toHaveLength(1);
      expect(inProgress).toHaveLength(1);
      expect(completed).toHaveLength(1);
    });
  });
});
