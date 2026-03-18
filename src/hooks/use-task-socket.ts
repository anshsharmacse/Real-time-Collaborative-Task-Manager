"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { useTaskStore } from "@/lib/store/task-store";

export function useTaskSocket() {
  const { data: session, status } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const { addTask, updateTask, removeTask } = useTaskStore();

  const connect = useCallback(() => {
    if (status !== "authenticated" || !session?.user || socketRef.current?.connected) {
      return;
    }

    // Connect to websocket server
    // Never use PORT in the URL, always use XTransformPort
    const socketInstance = io("/?XTransformPort=3003", {
      transports: ["websocket", "polling"],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      console.log("[TaskSocket] Connected to server");
      // Authenticate with user info
      socketInstance.emit("authenticate", {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
      });
    });

    socketInstance.on("disconnect", () => {
      console.log("[TaskSocket] Disconnected from server");
    });

    socketInstance.on("authenticated", () => {
      console.log("[TaskSocket] Authenticated successfully");
    });

    // Handle task assignment notification
    socketInstance.on("task:assigned", (data: { type: string; task: unknown }) => {
      console.log("[TaskSocket] Task assigned:", data.task);
      addTask(data.task as Parameters<typeof addTask>[0]);
    });

    // Handle task update notification
    socketInstance.on("task:updated", (data: { type: string; task: unknown }) => {
      console.log("[TaskSocket] Task updated:", data.task);
      updateTask(data.task as Parameters<typeof updateTask>[0]);
    });

    // Handle task deletion notification
    socketInstance.on("task:deleted", (data: { type: string; taskId: string }) => {
      console.log("[TaskSocket] Task deleted:", data.taskId);
      removeTask(data.taskId);
    });

    socketInstance.on("error", (error: Error) => {
      console.error("[TaskSocket] Error:", error);
    });
  }, [session, status, addTask, updateTask, removeTask]);

  // Notify about task creation
  const notifyTaskCreated = useCallback((task: unknown, assigneeEmail?: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("task:created", { task, assigneeEmail });
    }
  }, []);

  // Notify about task update
  const notifyTaskUpdated = useCallback((task: unknown, previousAssigneeEmail?: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("task:updated", { task, previousAssigneeEmail });
    }
  }, []);

  // Notify about task deletion
  const notifyTaskDeleted = useCallback(
    (taskId: string, taskTitle: string, assigneeEmail?: string, creatorEmail?: string) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("task:deleted", {
          taskId,
          taskTitle,
          assigneeEmail,
          creatorEmail,
        });
      }
    },
    []
  );

  useEffect(() => {
    if (status === "authenticated") {
      connect();
    }

    return () => {
      // Cleanup: disconnect socket on unmount
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [status, connect]);

  return {
    notifyTaskCreated,
    notifyTaskUpdated,
    notifyTaskDeleted,
  };
}
