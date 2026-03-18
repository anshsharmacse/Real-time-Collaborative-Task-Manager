import { PrismaClient, TaskStatus, TaskPriority } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users
  console.log("Creating demo users...");
  const user1 = await prisma.user.create({
    data: {
      email: "demo@example.com",
      name: "Demo User",
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=demo`,
      emailVerified: new Date(),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "colleague@example.com",
      name: "Colleague",
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=colleague`,
      emailVerified: new Date(),
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "manager@example.com",
      name: "Manager",
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=manager`,
      emailVerified: new Date(),
    },
  });

  console.log("Created users:", { user1, user2, user3 });

  // Create demo tasks
  console.log("Creating demo tasks...");

  // Pending tasks
  await prisma.task.create({
    data: {
      title: "Design new landing page",
      description: "Create wireframes and mockups for the new landing page redesign",
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      creatorId: user3.id,
      assigneeId: user1.id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Review pull requests",
      description: "Review and provide feedback on open pull requests",
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      creatorId: user1.id,
      assigneeId: user1.id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Update documentation",
      description: "Update the API documentation with new endpoints",
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      creatorId: user2.id,
      assigneeEmail: "newdev@example.com",
    },
  });

  // In Progress tasks
  await prisma.task.create({
    data: {
      title: "Implement authentication flow",
      description: "Set up Google OAuth and JWT authentication",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      creatorId: user1.id,
      assigneeId: user1.id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Set up CI/CD pipeline",
      description: "Configure GitHub Actions for automated testing and deployment",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      creatorId: user3.id,
      assigneeId: user2.id,
    },
  });

  // Completed tasks
  await prisma.task.create({
    data: {
      title: "Initial project setup",
      description: "Set up the Next.js project with TypeScript and Tailwind CSS",
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      creatorId: user1.id,
      assigneeId: user1.id,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.task.create({
    data: {
      title: "Create database schema",
      description: "Design and implement the Prisma schema for users and tasks",
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      creatorId: user1.id,
      assigneeId: user1.id,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.task.create({
    data: {
      title: "Write unit tests",
      description: "Add unit tests for core components",
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.MEDIUM,
      creatorId: user2.id,
      assigneeId: user1.id,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Task assigned to pending user
  await prisma.task.create({
    data: {
      title: "Onboard new team member",
      description: "Prepare onboarding materials and schedule introduction meetings",
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      creatorId: user3.id,
      assigneeEmail: "newmember@example.com",
    },
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
