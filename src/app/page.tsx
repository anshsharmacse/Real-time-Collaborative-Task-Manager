"use client";

import { useEffect, useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Shield, Zap, Users, ArrowRight, 
  CheckCircle2, Clock, ListTodo, TrendingUp
} from "lucide-react";

import { Header } from "@/components/tasks/header";
import { TaskBoard } from "@/components/tasks/task-board";
import { useTaskStore, Task, TaskPriority } from "@/lib/store/task-store";
import { useTaskSocket } from "@/hooks/use-task-socket";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const {
    tasks,
    isLoading,
    error,
    setTasks,
    addTask,
    updateTask,
    removeTask,
    setLoading,
    setError,
  } = useTaskStore();

  const { notifyTaskCreated, notifyTaskUpdated, notifyTaskDeleted } =
    useTaskSocket();

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (status !== "authenticated") return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data.tasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [status, setTasks, setLoading, setError]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create task
  const handleCreateTask = async (data: {
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: Date | null;
    assigneeEmail?: string;
  }) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          priority: data.priority,
          dueDate: data.dueDate?.toISOString(),
          assigneeEmail: data.assigneeEmail || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create task");
      }

      const newTask = (await response.json()).task;
      addTask(newTask);

      // Notify via socket
      notifyTaskCreated(newTask, data.assigneeEmail);

      toast({
        title: "Task created",
        description: data.assigneeEmail
          ? `Task assigned to ${data.assigneeEmail}`
          : "Your task has been created successfully.",
      });
    } catch (err) {
      console.error("Error creating task:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to create task",
        variant: "destructive",
      });
      throw err;
    }
  };

  // Update task
  const handleUpdateTask = async (
    taskId: string,
    data: Partial<{
      title: string;
      description: string | null;
      status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
      priority: "LOW" | "MEDIUM" | "HIGH";
      dueDate: Date | null;
      assigneeEmail: string | null;
    }>
  ) => {
    const previousTask = tasks.find((t) => t.id === taskId);
    const previousAssigneeEmail = previousTask?.assigneeEmail;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dueDate: data.dueDate?.toISOString() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update task");
      }

      const updatedTask = (await response.json()).task;
      updateTask(updatedTask);

      // Notify via socket
      notifyTaskUpdated(updatedTask, previousAssigneeEmail);

      toast({
        title: "Task updated",
        description: "Your changes have been saved.",
      });
    } catch (err) {
      console.error("Error updating task:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update task",
        variant: "destructive",
      });
      throw err;
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete task");
      }

      removeTask(taskId);

      // Notify via socket
      if (task) {
        notifyTaskDeleted(
          taskId,
          task.title,
          task.assigneeEmail || undefined,
          task.creator.email
        );
      }

      toast({
        title: "Task deleted",
        description: "The task has been removed.",
      });
    } catch (err) {
      console.error("Error deleting task:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to delete task",
        variant: "destructive",
      });
      throw err;
    }
  };

  // Landing page for unauthenticated users
  const LandingPage = () => (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-emerald-50/30 dark:to-emerald-950/10">
      <Header />

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 lg:py-32 px-4 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-400/10 dark:bg-teal-500/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-emerald-500/5 via-transparent to-transparent rounded-full" />
          </div>

          <div className="container relative mx-auto text-center max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-8 border border-emerald-200 dark:border-emerald-800"
              >
                <Sparkles className="w-4 h-4" />
                <span>Real-time Collaboration Platform</span>
              </motion.div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6">
                <span className="block">Manage Tasks,</span>
                <span className="gradient-text">Together in Real-time</span>
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
                A modern collaborative task manager with instant updates. 
                Create tasks, assign to teammates, and watch changes happen live.
              </p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Button
                  onClick={() => {
                    const demoBtn = document.querySelector('button[data-demo="true"]') as HTMLButtonElement;
                    demoBtn?.click();
                  }}
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-lg border-2 hover:bg-accent"
                >
                  <Sparkles className="mr-2 w-5 h-5" />
                  Try Demo Instantly
                </Button>
                <Button
                  onClick={() => {
                    const googleBtn = document.querySelector('button[data-google="true"]') as HTMLButtonElement;
                    googleBtn?.click();
                  }}
                  size="lg"
                  className="h-14 px-8 text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/25 glow-emerald"
                  data-google-cta
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Simple as <span className="gradient-text">1, 2, 3</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Get started in seconds, not hours.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <StepCard
                number={1}
                icon={<ListTodo className="w-5 h-5" />}
                title="Create a Task"
                description="Add tasks with title, description, priority, and due date."
              />
              <StepCard
                number={2}
                icon={<Users className="w-5 h-5" />}
                title="Assign Teammates"
                description="Enter their email and they'll see the task when they join."
              />
              <StepCard
                number={3}
                icon={<CheckCircle2 className="w-5 h-5" />}
                title="Track Progress"
                description="Watch tasks move from pending to done in real-time."
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Everything you need to{" "}
                <span className="gradient-text">collaborate</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built for teams who want to stay in sync without the complexity of enterprise tools.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<Shield className="w-6 h-6" />}
                title="Secure Auth"
                description="Google OAuth for seamless, secure authentication. Your data stays private."
                delay={0.1}
              />
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Real-time Sync"
                description="See task changes instantly. No refresh needed. WebSocket-powered updates."
                delay={0.2}
              />
              <FeatureCard
                icon={<Users className="w-6 h-6" />}
                title="Easy Assignment"
                description="Assign tasks by email. Teammates see their tasks as soon as they join."
                delay={0.3}
              />
              <FeatureCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="Track Progress"
                description="Visual status tracking. See what's pending, in progress, and done."
                delay={0.4}
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t mt-auto bg-card/50">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center gap-4 text-center">
              {/* Logo and Brand */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z"/>
                    <path d="M8 16L12 20L16 16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
                  </svg>
                </div>
                <span className="text-lg font-bold gradient-text">TaskFlow</span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Real-time Collaborative Task Manager
              </p>
              
              {/* Developer Info */}
              <div className="pt-4 border-t w-full max-w-md">
                <p className="text-sm font-medium">
                  Developed by: <span className="gradient-text">ANSH SHARMA</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  National Institute of Technology Calicut
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );

  const FeatureCard = ({
    icon,
    title,
    description,
    delay,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    delay: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </motion.div>
  );

  const StepCard = ({
    number,
    icon,
    title,
    description,
  }: {
    number: number;
    icon: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: number * 0.1 }}
      className="relative bg-card border rounded-2xl p-6 text-center"
    >
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-sm font-bold shadow-lg">
        {number}
      </div>
      <div className="mt-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          {icon}
        </div>
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <p className="text-muted-foreground animate-pulse">Loading TaskFlow...</p>
        </motion.div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (status === "unauthenticated") {
    return <LandingPage />;
  }

  // Main app for authenticated users
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-emerald-50/20 dark:to-emerald-950/5">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
        <TaskBoard
          tasks={tasks}
          isLoading={isLoading && isInitialLoad}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t mt-auto bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm shadow-emerald-500/20">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z"/>
                </svg>
              </div>
              <span className="font-medium gradient-text">TaskFlow</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              <p>Real-time Collaborative Task Manager</p>
              <span className="hidden sm:inline">•</span>
              <p>Developed by: <span className="font-medium text-foreground">ANSH SHARMA</span></p>
            </div>
            <p className="text-xs text-muted-foreground">NIT Calicut</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
