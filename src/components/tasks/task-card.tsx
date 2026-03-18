"use client";

import { motion } from "framer-motion";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import {
  Calendar,
  Clock,
  MoreHorizontal,
  Pencil,
  Trash2,
  User,
  UserPlus,
  CheckCircle2,
  Circle,
  Timer,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { Task, TaskPriority, TaskStatus } from "@/lib/store/task-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  currentUserId: string;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const priorityConfig: Record<TaskPriority, { 
  label: string; 
  color: string;
  dot: string;
}> = {
  LOW: {
    label: "Low",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    dot: "bg-slate-400",
  },
  MEDIUM: {
    label: "Medium",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-700",
    dot: "bg-amber-500",
  },
  HIGH: {
    label: "High",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-700",
    dot: "bg-rose-500",
  },
};

const statusConfig: Record<TaskStatus, { 
  icon: React.ReactNode; 
  label: string;
  color: string;
  bg: string;
  border: string;
  hover: string;
}> = {
  PENDING: { 
    icon: <Circle className="w-3.5 h-3.5" />, 
    label: "Pending",
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800/60",
    border: "border-slate-200 dark:border-slate-700",
    hover: "hover:bg-slate-200 dark:hover:bg-slate-700",
  },
  IN_PROGRESS: { 
    icon: <Timer className="w-3.5 h-3.5" />, 
    label: "In Progress",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    border: "border-amber-200 dark:border-amber-700",
    hover: "hover:bg-amber-200 dark:hover:bg-amber-800/40",
  },
  COMPLETED: { 
    icon: <CheckCircle2 className="w-3.5 h-3.5" />, 
    label: "Done",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    border: "border-emerald-200 dark:border-emerald-700",
    hover: "hover:bg-emerald-200 dark:hover:bg-emerald-800/40",
  },
};

export function TaskCard({
  task,
  currentUserId,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const isCreator = task.creatorId === currentUserId;
  const isAssignee = task.assigneeId === currentUserId;
  const canEdit = isCreator || isAssignee;
  const canDelete = isCreator;

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && task.status !== "COMPLETED";
  const isDueToday = dueDate && isToday(dueDate);
  const isDueTomorrow = dueDate && isTomorrow(dueDate);

  const currentStatus = statusConfig[task.status];
  const currentPriority = priorityConfig[task.priority];

  const formatDueDate = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-200 border",
          task.status === "COMPLETED" && "opacity-70",
          "hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800",
          isOverdue && "border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/10"
        )}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                    "border shadow-sm",
                    currentStatus.bg,
                    currentStatus.border,
                    currentStatus.color,
                    currentStatus.hover,
                    "hover:shadow-md active:scale-95",
                    "focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  )}
                >
                  {currentStatus.icon}
                  <span className="hidden sm:inline">{currentStatus.label}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem
                  onClick={() => onStatusChange(task.id, "PENDING")}
                  className={cn(
                    "gap-3 cursor-pointer py-2",
                    task.status === "PENDING" && "bg-accent"
                  )}
                >
                  <Circle className="w-4 h-4 text-slate-500" />
                  <span>Pending</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onStatusChange(task.id, "IN_PROGRESS")}
                  className={cn(
                    "gap-3 cursor-pointer py-2",
                    task.status === "IN_PROGRESS" && "bg-accent"
                  )}
                >
                  <Timer className="w-4 h-4 text-amber-500" />
                  <span>In Progress</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onStatusChange(task.id, "COMPLETED")}
                  className={cn(
                    "gap-3 cursor-pointer py-2",
                    task.status === "COMPLETED" && "bg-accent"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Completed</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      "font-semibold leading-tight mb-1.5 text-base",
                      task.status === "COMPLETED" && "line-through text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Actions Menu */}
                {(canEdit || canDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hover:bg-accent"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      {canEdit && (
                        <DropdownMenuItem onClick={() => onEdit(task)} className="gap-2 cursor-pointer">
                          <Pencil className="w-4 h-4" />
                          <span>Edit Task</span>
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => onDelete(task)}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Task</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Meta Info Row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                {/* Priority Badge */}
                <Badge
                  variant="outline"
                  className={cn("text-xs font-medium gap-1.5 px-2 py-0.5", currentPriority.color)}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", currentPriority.dot)} />
                  {currentPriority.label}
                </Badge>

                {/* Divider */}
                <div className="hidden sm:block w-px h-4 bg-border" />

                {/* Due Date */}
                {dueDate && (
                  <div
                    className={cn(
                      "flex items-center gap-1.5 font-medium",
                      isOverdue ? "text-rose-600 dark:text-rose-400" :
                      isDueToday ? "text-amber-600 dark:text-amber-400" :
                      "text-muted-foreground"
                    )}
                  >
                    {isOverdue ? (
                      <AlertCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Calendar className="w-3.5 h-3.5" />
                    )}
                    <span>{formatDueDate(dueDate)}</span>
                    {isOverdue && <span className="sr-only">(overdue)</span>}
                  </div>
                )}

                {/* Created Date */}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{format(new Date(task.createdAt), "MMM d")}</span>
                </div>
              </div>

              {/* Assignee Section */}
              {(task.assignee || task.assigneeEmail) && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Assigned to:</span>
                  </div>
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5 ring-2 ring-background">
                        <AvatarImage
                          src={task.assignee.image || undefined}
                          alt={task.assignee.name || "Assignee"}
                        />
                        <AvatarFallback className="text-[10px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                          {task.assignee.name?.charAt(0).toUpperCase() ||
                            task.assignee.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium truncate max-w-[150px]">
                        {task.assignee.name || task.assignee.email}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {task.assigneeEmail}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700"
                      >
                        Pending
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Quick Status Buttons */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t sm:hidden">
            <span className="text-xs text-muted-foreground mr-1">Status:</span>
            {(["PENDING", "IN_PROGRESS", "COMPLETED"] as TaskStatus[]).map((status) => {
              const config = statusConfig[status];
              const isActive = task.status === status;
              return (
                <button
                  key={status}
                  onClick={() => onStatusChange(task.id, status)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                    "border",
                    isActive
                      ? cn(config.bg, config.color, "ring-2 ring-offset-1 ring-emerald-500/30", config.border)
                      : "bg-background text-muted-foreground border-border hover:bg-muted"
                  )}
                >
                  {config.icon}
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
