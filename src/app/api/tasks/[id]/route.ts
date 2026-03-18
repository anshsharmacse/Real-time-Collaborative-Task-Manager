import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Schema for updating a task
const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long").optional(),
  description: z.string().max(500, "Description is too long").optional().nullable(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().optional().nullable(),
  assigneeEmail: z.string().email("Invalid email address").optional().nullable(),
});

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const task = await db.task.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true, image: true }
        },
        assignee: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this task
    const hasAccess = 
      task.creatorId === session.user.id ||
      task.assigneeId === session.user.id ||
      task.assigneeEmail === session.user.email;

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    // Check if task exists and user has access
    const existingTask = await db.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Check if user has access to update this task
    const hasAccess = 
      existingTask.creatorId === session.user.id ||
      existingTask.assigneeId === session.user.id ||
      existingTask.assigneeEmail === session.user.email;

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: {
      title?: string;
      description?: string | null;
      status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
      priority?: "LOW" | "MEDIUM" | "HIGH";
      dueDate?: Date | null;
      assigneeEmail?: string | null;
      assigneeId?: string | null;
      completedAt?: Date | null;
    } = {};

    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title;
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
      // Set completedAt when status changes to COMPLETED
      if (validatedData.status === "COMPLETED") {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }
    if (validatedData.priority !== undefined) {
      updateData.priority = validatedData.priority;
    }
    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null;
    }

    // Handle assignee email update
    if (validatedData.assigneeEmail !== undefined) {
      updateData.assigneeEmail = validatedData.assigneeEmail;
      
      if (validatedData.assigneeEmail) {
        // Check if trying to assign to self
        if (validatedData.assigneeEmail === session.user.email) {
          updateData.assigneeId = session.user.id;
        } else {
          // Find existing user by email
          const existingUser = await db.user.findUnique({
            where: { email: validatedData.assigneeEmail }
          });
          
          if (existingUser) {
            updateData.assigneeId = existingUser.id;
          } else {
            updateData.assigneeId = null;
          }
        }
      } else {
        updateData.assigneeId = null;
      }
    }

    const task = await db.task.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: { id: true, name: true, email: true, image: true }
        },
        assignee: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if task exists and user has access
    const existingTask = await db.task.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Only creator can delete the task
    if (existingTask.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the task creator can delete this task" },
        { status: 403 }
      );
    }

    await db.task.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
