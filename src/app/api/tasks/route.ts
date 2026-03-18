import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Schema for creating a task
const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
  assigneeEmail: z.string().email("Invalid email address").optional().nullable(),
});

// GET /api/tasks - Get all tasks for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get tasks created by the user OR assigned to the user
    const tasks = await db.task.findMany({
      where: {
        OR: [
          { creatorId: session.user.id },
          { 
            OR: [
              { assigneeId: session.user.id },
              { assigneeEmail: session.user.email }
            ]
          }
        ]
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, image: true }
        },
        assignee: {
          select: { id: true, name: true, email: true, image: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    let assigneeId: string | null = null;

    // If assignee email is provided, find or prepare for assignment
    if (validatedData.assigneeEmail) {
      // Check if trying to assign to self
      if (validatedData.assigneeEmail === session.user.email) {
        assigneeId = session.user.id;
      } else {
        // Find existing user by email
        const existingUser = await db.user.findUnique({
          where: { email: validatedData.assigneeEmail }
        });
        
        if (existingUser) {
          assigneeId = existingUser.id;
        }
        // If user doesn't exist, we store the email and will link when they join
      }
    }

    const task = await db.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        creatorId: session.user.id,
        assigneeId: assigneeId,
        assigneeEmail: validatedData.assigneeEmail || null,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, image: true }
        },
        assignee: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
