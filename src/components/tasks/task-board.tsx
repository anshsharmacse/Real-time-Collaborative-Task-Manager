"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, ListTodo, Clock, CheckCircle2, Filter, AlertCircle } from "lucide-react";

import { Task, TaskStatus, TaskPriority } from "@/lib/store/task-store";
import { TaskCard } from "./task-card";
import { TaskFormDialog } from "./task-form-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TaskBoardProps {
  tasks: Task[];
  isLoading: boolean;
  onCreateTask: (data: {
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: Date | null;
    assigneeEmail?: string;
  }) => Promise<void>;
  onUpdateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export function TaskBoard({
  tasks,
  isLoading,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}: TaskBoardProps) {
  const { data: session } = useSession();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const handleCreate = async (data: {
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: Date | null;
    assigneeEmail?: string;
  }) => {
    setIsSubmitting(true);
    try {
      await onCreateTask(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: {
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: Date | null;
    assigneeEmail?: string;
  }) => {
    if (!editingTask) return;
    setIsSubmitting(true);
    try {
      await onUpdateTask(editingTask.id, {
        ...data,
        assigneeEmail: data.assigneeEmail || null,
      });
      setEditingTask(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    setIsSubmitting(true);
    try {
      await onDeleteTask(deletingTask.id);
      setDeletingTask(null);
      setIsDeleteOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await onUpdateTask(taskId, { status });
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (task: Task) => {
    setDeletingTask(task);
    setIsDeleteOpen(true);
  };

  // Filter tasks by priority
  const filteredTasks = tasks.filter((task) => {
    if (priorityFilter === "all") return true;
    return task.priority === priorityFilter;
  });

  // Group tasks by status
  const pendingTasks = filteredTasks.filter((t) => t.status === "PENDING");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "IN_PROGRESS");
  const completedTasks = filteredTasks.filter((t) => t.status === "COMPLETED");

  // Stats
  const stats = {
    total: tasks.length,
    pending: pendingTasks.length,
    inProgress: inProgressTasks.length,
    completed: completedTasks.length,
    highPriority: tasks.filter(t => t.priority === "HIGH").length,
  };

  const TaskSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="border rounded-xl p-5 bg-card"
        >
          <div className="flex items-start gap-4">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = ({ status }: { status: TaskStatus }) => {
    const messages = {
      PENDING: {
        icon: ListTodo,
        title: "No pending tasks",
        description: "Tasks waiting to be started will appear here",
        gradient: "from-slate-500/20 to-slate-600/20",
        iconColor: "text-slate-500",
      },
      IN_PROGRESS: {
        icon: Clock,
        title: "No tasks in progress",
        description: "Tasks you're working on will appear here",
        gradient: "from-amber-500/20 to-amber-600/20",
        iconColor: "text-amber-500",
      },
      COMPLETED: {
        icon: CheckCircle2,
        title: "No completed tasks",
        description: "Finished tasks will appear here",
        gradient: "from-emerald-500/20 to-emerald-600/20",
        iconColor: "text-emerald-500",
      },
    };

    const { icon: Icon, title, description, gradient, iconColor } = messages[status];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className={cn(
          "w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4",
          gradient
        )}>
          <Icon className={cn("w-10 h-10", iconColor)} />
        </div>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {description}
        </p>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Title and Stats Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl sm:text-3xl font-bold">My Tasks</h2>
              <Badge variant="secondary" className="text-sm">
                {stats.total} total
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Manage and track your tasks in real-time
            </p>
          </div>
          
          {/* Create Task Button */}
          <Button
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 glow-emerald h-12 px-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Task
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<Circle className="w-4 h-4" />}
            color="text-slate-500"
            bg="bg-slate-100 dark:bg-slate-800/50"
          />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            icon={<Clock className="w-4 h-4" />}
            color="text-amber-500"
            bg="bg-amber-100 dark:bg-amber-900/30"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={<CheckCircle2 className="w-4 h-4" />}
            color="text-emerald-500"
            bg="bg-emerald-100 dark:bg-emerald-900/30"
          />
          <StatCard
            label="High Priority"
            value={stats.highPriority}
            icon={<AlertCircle className="w-4 h-4" />}
            color="text-rose-500"
            bg="bg-rose-100 dark:bg-rose-900/30"
          />
        </div>

        {/* Filter Row */}
        <div className="flex items-center gap-3">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px] h-10">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="HIGH">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  High
                </div>
              </SelectItem>
              <SelectItem value="MEDIUM">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  Medium
                </div>
              </SelectItem>
              <SelectItem value="LOW">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  Low
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted/50">
          <TabsTrigger value="all" className="gap-2 data-[state=active]:bg-background">
            <ListTodo className="w-4 h-4" />
            <span className="hidden sm:inline">All</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {filteredTasks.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-background">
            <Circle className="w-4 h-4" />
            <span className="hidden sm:inline">Pending</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {pendingTasks.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="gap-2 data-[state=active]:bg-background">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Active</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {inProgressTasks.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2 data-[state=active]:bg-background">
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">Done</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {completedTasks.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-22rem)] mt-6 scrollbar-thin">
          {isLoading ? (
            <TaskSkeleton />
          ) : (
            <>
              <TabsContent value="all" className="m-0">
                {filteredTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-6">
                      <ListTodo className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h3 className="font-semibold text-xl mb-2">No tasks yet</h3>
                    <p className="text-muted-foreground max-w-xs mb-6">
                      Create your first task to get started with TaskFlow
                    </p>
                    <Button
                      onClick={() => {
                        setEditingTask(null);
                        setIsFormOpen(true);
                      }}
                      size="lg"
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 pr-4">
                    <AnimatePresence mode="popLayout">
                      {filteredTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          currentUserId={session?.user?.id || ""}
                          onEdit={openEditDialog}
                          onDelete={openDeleteDialog}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pending" className="m-0">
                {pendingTasks.length === 0 ? (
                  <EmptyState status="PENDING" />
                ) : (
                  <div className="space-y-3 pr-4">
                    <AnimatePresence mode="popLayout">
                      {pendingTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          currentUserId={session?.user?.id || ""}
                          onEdit={openEditDialog}
                          onDelete={openDeleteDialog}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="in-progress" className="m-0">
                {inProgressTasks.length === 0 ? (
                  <EmptyState status="IN_PROGRESS" />
                ) : (
                  <div className="space-y-3 pr-4">
                    <AnimatePresence mode="popLayout">
                      {inProgressTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          currentUserId={session?.user?.id || ""}
                          onEdit={openEditDialog}
                          onDelete={openDeleteDialog}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="m-0">
                {completedTasks.length === 0 ? (
                  <EmptyState status="COMPLETED" />
                ) : (
                  <div className="space-y-3 pr-4">
                    <AnimatePresence mode="popLayout">
                      {completedTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          currentUserId={session?.user?.id || ""}
                          onEdit={openEditDialog}
                          onDelete={openDeleteDialog}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </ScrollArea>
      </Tabs>

      {/* Create/Edit Dialog */}
      <TaskFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingTask(null);
        }}
        onSubmit={editingTask ? handleEdit : handleCreate}
        task={editingTask}
        currentUserEmail={session?.user?.email || ""}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        task={deletingTask}
        isLoading={isSubmitting}
      />
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  label, 
  value, 
  icon, 
  color, 
  bg 
}: { 
  label: string; 
  value: number; 
  icon: React.ReactNode; 
  color: string;
  bg: string;
}) {
  return (
    <div className={cn("rounded-xl p-3 flex items-center gap-3", bg)}>
      <div className={cn("p-2 rounded-lg bg-background/50", color)}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

// Circle icon component
function Circle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
