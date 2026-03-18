# TaskFlow - Real-time Collaborative Task Manager

A modern, production-ready collaborative task management application featuring real-time updates, Google authentication, and seamless task assignment by email.

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Database Design](#database-design)
- [Authentication Flow](#authentication-flow)
- [Real-time Architecture](#real-time-architecture)
- [API Design](#api-design)
- [UI Component Design](#ui-component-design)
- [State Management](#state-management)
- [Deployment Guide](#deployment-guide)
- [Local Development](#local-development)
- [Testing](#testing)
- [AI Usage Disclosure](#ai-usage-disclosure)
- [Assumptions and Trade-offs](#assumptions-and-trade-offs)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [Developer](#developer)

---

## Overview

TaskFlow is a real-time collaborative task manager built for modern teams. It enables users to create, manage, and assign tasks seamlessly while providing instant updates through WebSocket technology.

### Project Context

| Aspect | Details |
|--------|---------|
| Expected Time | 6 to 10 hours |
| Deadline | March 21, 2026, 11:59 PM |
| Submission | GitHub Repository Link |

### Problem Statement

The goal is to build a Real-time Collaborative Task Manager that demonstrates secure authentication, relational data management, premium user interface design, and end-to-end deployment capabilities.

---

## Live Demo

**Production URL:** [https://taskflow-fawn-psi.vercel.app](https://taskflow-fawn-psi.vercel.app)

**Socket Service:** [https://taskflow-socket-production.up.railway.app](https://taskflow-socket-production.up.railway.app)

**GitHub Repository:** [https://github.com/anshsharmacse/taskflow](https://github.com/anshsharmacse/taskflow)

### Quick Demo Access

- **Demo Login:** Click "Demo Login" button and enter any email address
- **Google Sign In:** Use your Google account for full OAuth experience

---

## Features

### Core Functionality

| Feature | Description | Status |
|---------|-------------|--------|
| Google Authentication | Secure OAuth 2.0 login with Google | Implemented |
| Demo Login | Instant access without Google account | Implemented |
| Task CRUD Operations | Create, read, update, and delete tasks | Implemented |
| Task Assignment | Assign tasks to users by email address | Implemented |
| Real-time Updates | Live task synchronization via WebSockets | Implemented |
| Dark Mode | Complete theme switching support | Implemented |
| Responsive Design | Optimized for desktop, tablet, and mobile | Implemented |

---

## System Architecture

### High-Level Architecture

The application follows a modern three-tier architecture with separated frontend and real-time services.

```mermaid
graph TB
    subgraph Client Layer
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end
    
    subgraph Frontend - Vercel
        NextApp[Next.js Application]
        SSR[Server-Side Rendering]
    end
    
    subgraph Backend Services
        API[REST API Routes]
        Auth[NextAuth.js]
        Socket[Socket.io Server]
    end
    
    subgraph Data Layer
        PostgreSQL[(PostgreSQL Database)]
    end
    
    subgraph External Services
        Google[Google OAuth]
        Supabase[Supabase Hosting]
        Railway[Railway Socket Hosting]
    end
    
    Browser --> NextApp
    Mobile --> NextApp
    NextApp --> SSR
    NextApp --> API
    NextApp --> Socket
    API --> Auth
    API --> PostgreSQL
    Auth --> Google
    Auth --> PostgreSQL
    Socket --> Railway
    PostgreSQL --> Supabase
```

### Architecture Explanation

The system is designed with clear separation of concerns:

**Frontend Layer:** The Next.js application handles server-side rendering for optimal SEO and performance. It communicates with both the REST API and the Socket.io server.

**Backend Layer:** API routes handle CRUD operations while NextAuth.js manages authentication. The socket server handles all real-time communication.

**Data Layer:** PostgreSQL database hosted on Supabase provides reliable data persistence with ACID compliance.

### Component Interaction Flow

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant Database
    participant Socket
    participant OtherUsers
    
    User->>Client: Create Task
    Client->>API: POST /api/tasks
    API->>Database: Insert Task
    Database-->>API: Task Created
    API-->>Client: Task Response
    Client->>Socket: Emit task created
    Socket->>OtherUsers: Broadcast task assigned
    OtherUsers-->>User: Real-time UI Update
```

---

## Tech Stack

### Technology Selection Rationale

```mermaid
mindmap
  root((TaskFlow Stack))
    Frontend
      Next.js 16
        App Router for modern routing
        Server Components for performance
        Built-in API routes
      TypeScript
        Type safety throughout
        Enhanced developer experience
      Tailwind CSS 4
        Utility-first styling
        Custom design system
      shadcn/ui
        Accessible components
        Fully customizable
      Framer Motion
        Smooth animations
        Gesture support
    Backend
      NextAuth.js v4
        Google OAuth provider
        JWT session strategy
      Prisma ORM
        Type-safe queries
        Database migrations
      Socket.io
        WebSocket communication
        Automatic reconnection
    Database
      SQLite for Development
        Zero configuration
        Fast local testing
      PostgreSQL for Production
        Supabase hosting
        Reliable and scalable
    Deployment
      Vercel for Frontend
        Edge functions
        Automatic deployments
      Railway for Socket Service
        WebSocket support
        Simple configuration
```

### Technology Details

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | Next.js | 16.x | Full-stack React framework with App Router |
| Language | TypeScript | 5.x | Type safety and improved developer experience |
| Styling | Tailwind CSS | 4.x | Utility-first CSS framework |
| UI Components | shadcn/ui | Latest | Accessible, customizable components |
| Database ORM | Prisma | 6.x | Type-safe database access and migrations |
| Database | PostgreSQL | 15.x | Production database hosted on Supabase |
| Authentication | NextAuth.js | 4.x | OAuth and session management |
| Real-time | Socket.io | 4.x | WebSocket-based real-time communication |
| State Management | Zustand | 5.x | Lightweight client state management |
| Animations | Framer Motion | 12.x | Declarative animations |
| Form Handling | React Hook Form | 7.x | Performant form management |
| Validation | Zod | 4.x | Schema validation |

---

## Database Design

### Entity Relationship Diagram

The database consists of two primary entities: Users and Tasks. The relationship supports both task creation and assignment.

```mermaid
erDiagram
    USER ||--o{ TASK : creates
    USER ||--o{ TASK : assigned to
    
    USER {
        string id PK
        string email UK
        string name
        string image
        string googleId UK
        datetime emailVerified
        datetime createdAt
        datetime updatedAt
    }
    
    TASK {
        string id PK
        string title
        string description
        enum status
        enum priority
        datetime dueDate
        string creatorId FK
        string assigneeId FK
        string assigneeEmail
        datetime createdAt
        datetime updatedAt
        datetime completedAt
    }
    
    TASK }|--|| USER : creator
    TASK }|--o| USER : assignee
```

### Database Schema Explanation

**User Table:** Stores user information including OAuth identifiers. The `googleId` field links Google accounts while `emailVerified` tracks verification status.

**Task Table:** Contains all task data with foreign key relationships to both creator and optional assignee. The `assigneeEmail` field supports assigning tasks to users who have not yet registered.

### Task Status State Machine

Tasks transition through a defined state lifecycle:

```mermaid
stateDiagram-v2
    [*] --> PENDING: Task Created
    PENDING --> IN_PROGRESS: Start Working
    IN_PROGRESS --> COMPLETED: Mark Complete
    IN_PROGRESS --> PENDING: Move Back
    COMPLETED --> IN_PROGRESS: Reopen Task
    COMPLETED --> [*]: Delete Task
    PENDING --> [*]: Delete Task
```

### Database Indexes

The following indexes optimize query performance:

```sql
-- User table indexes
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_googleId_idx ON users("googleId");

-- Task table indexes
CREATE INDEX tasks_creatorId_idx ON tasks("creatorId");
CREATE INDEX tasks_assigneeId_idx ON tasks("assigneeId");
CREATE INDEX tasks_status_idx ON tasks(status);
CREATE INDEX tasks_priority_idx ON tasks(priority);
```

---

## Authentication Flow

### Google OAuth Authentication

The application uses NextAuth.js with Google OAuth for secure authentication.

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant NextAuth
    participant Google
    participant Database
    
    User->>Client: Click Sign in with Google
    Client->>NextAuth: Request Google Auth
    NextAuth->>Google: Redirect to OAuth
    Google->>User: Show Consent Screen
    User->>Google: Grant Permission
    Google->>NextAuth: Return Auth Code
    NextAuth->>Google: Exchange Code for Token
    Google->>NextAuth: Return Access Token
    NextAuth->>Database: Find or Create User
    Database->>NextAuth: User Data
    NextAuth->>Client: Create JWT Session
    Client->>User: Redirect to Dashboard
```

### Demo Login Flow

For users without Google accounts or for testing purposes:

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant Database
    
    User->>Client: Click Demo Login
    User->>Client: Enter Email Address
    Client->>API: POST credentials
    API->>Database: Find User by Email
    
    alt User Exists
        Database-->>API: Return Existing User
    else User Not Found
        API->>Database: Create New User
        Database-->>API: Return New User
    end
    
    API-->>Client: Create JWT Session
    Client->>User: Redirect to Dashboard
```

### Session Management

The application uses JWT-based sessions for stateless authentication:

```mermaid
flowchart LR
    subgraph JWT Strategy
        A[User Login] --> B[Generate JWT Token]
        B --> C[Store in HttpOnly Cookie]
        C --> D[Subsequent Requests]
        D --> E[Validate JWT Token]
        E --> F{Token Valid?}
        F -->|Yes| G[Allow Access]
        F -->|No| H[Redirect to Login]
    end
```

### Authentication Callbacks

The authentication system implements custom callbacks for user management:

| Callback | Purpose |
|----------|---------|
| signIn | Create or update user in database on first login |
| jwt | Add user ID to JWT token |
| session | Expose user ID in client session |

---

## Real-time Architecture

### Socket.io Connection Flow

Real-time updates are powered by Socket.io with automatic reconnection and fallback to polling.

```mermaid
sequenceDiagram
    participant Client
    participant SocketServer
    participant Database
    participant OtherClients
    
    Client->>SocketServer: Connect via WebSocket
    SocketServer->>Client: Connection Acknowledged
    Client->>SocketServer: Authenticate with userId
    SocketServer->>SocketServer: Register User in Room
    SocketServer->>Client: Authentication Confirmed
    
    Note over Client,OtherClients: Task Creation Event
    Client->>SocketServer: Emit task created event
    SocketServer->>Database: Task Saved
    SocketServer->>OtherClients: Broadcast to assignee room
    OtherClients->>OtherClients: Update UI Instantly
```

### Socket Event Types

```mermaid
flowchart TD
    subgraph Client to Server Events
        C1[task created - New task notification]
        C2[task updated - Task modification]
        C3[task deleted - Task removal]
        C4[authenticate - User identification]
    end
    
    subgraph Server to Client Events
        S1[task assigned - Notification to assignee]
        S2[task updated - Broadcast to stakeholders]
        S3[task deleted - Removal notification]
        S4[authenticated - Confirmation response]
    end
    
    C1 --> S1
    C2 --> S2
    C3 --> S3
    C4 --> S4
```

### Room-based Broadcasting

Users are organized into rooms based on their user ID and email address for targeted notifications:

```mermaid
flowchart LR
    subgraph User Rooms
        R1[Room: user slash userId]
        R2[Room: email slash userEmail]
    end
    
    subgraph Broadcasting Logic
        B1[Task Creator Room]
        B2[Task Assignee Room]
        B3[Email-based Room]
    end
    
    R1 --> B1
    R2 --> B3
    B2 --> B3
```

### Real-time Update Scenarios

| Scenario | Event | Notification Target |
|----------|-------|---------------------|
| Task Created | task created | Assignee if specified |
| Task Updated | task updated | Creator and Assignee |
| Task Deleted | task deleted | Assignee if exists |
| Status Changed | task updated | All stakeholders |

---

## API Design

### RESTful Endpoints

```mermaid
graph LR
    subgraph Authentication Endpoints
        A1[POST /api/auth/signin]
        A2[POST /api/auth/signout]
        A3[GET /api/auth/session]
        A4[GET /api/auth/callback/google]
    end
    
    subgraph Task Endpoints
        T1[GET /api/tasks]
        T2[POST /api/tasks]
        T3[PUT /api/tasks/id]
        T4[DELETE /api/tasks/id]
    end
```

### API Request Response Flow

```mermaid
sequenceDiagram
    participant Client
    participant Middleware
    participant Handler
    participant Validator
    participant Database
    
    Client->>Middleware: HTTP Request
    Middleware->>Middleware: Check Authentication
    
    alt Not Authenticated
        Middleware-->>Client: 401 Unauthorized
    else Authenticated
        Middleware->>Handler: Forward Request
        Handler->>Validator: Validate Input
        
        alt Invalid Input
            Validator-->>Handler: Validation Error
            Handler-->>Client: 400 Bad Request
        else Valid Input
            Validator->>Database: Execute Query
            Database-->>Validator: Result Data
            Validator-->>Handler: Processed Data
            Handler-->>Client: 200 or 201 Response
        end
    end
```

### Endpoint Specifications

**GET /api/tasks**

Retrieves all tasks for the authenticated user, including tasks they created and tasks assigned to them.

| Field | Type | Description |
|-------|------|-------------|
| Response | Task Array | List of tasks with creator and assignee data |

**POST /api/tasks**

Creates a new task with optional assignment.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Task title, 1-100 characters |
| description | string | No | Task description, max 500 characters |
| priority | enum | No | LOW, MEDIUM, or HIGH, defaults to MEDIUM |
| dueDate | Date | No | Task due date |
| assigneeEmail | email | No | Email of assignee |

**PUT /api/tasks/:id**

Updates an existing task.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | Updated title |
| description | string | No | Updated description |
| status | enum | No | PENDING, IN_PROGRESS, or COMPLETED |
| priority | enum | No | Updated priority |
| dueDate | Date | No | Updated due date |
| assigneeEmail | email | No | Updated assignee |

**DELETE /api/tasks/:id**

Removes a task from the database.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Task ID to delete |

---

## UI Component Design

### Component Hierarchy

```mermaid
graph TB
    subgraph App Root
        Root[RootLayout]
        Providers[SessionProvider + ThemeProvider]
    end
    
    subgraph Page Components
        LP[Landing Page]
        DB[Dashboard]
    end
    
    subgraph Shared Components
        HD[Header]
        FT[Footer]
    end
    
    subgraph Task Components
        TB[TaskBoard]
        TF[TaskFormDialog]
        TC[TaskCard]
        DD[DeleteDialog]
    end
    
    subgraph UI Primitives
        BTN[Button]
        INP[Input]
        SLT[Select]
        DLG[Dialog]
        TST[Toast]
    end
    
    Root --> Providers
    Providers --> LP
    Providers --> DB
    
    LP --> HD
    LP --> FT
    DB --> HD
    DB --> FT
    DB --> TB
    TB --> TC
    TB --> TF
    TC --> DD
    
    TF --> BTN
    TF --> INP
    TF --> SLT
    TF --> DLG
```

### Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| RootLayout | Provides HTML structure and global providers |
| Header | Navigation, authentication controls, theme toggle |
| TaskBoard | Displays tasks in kanban-style columns |
| TaskCard | Individual task display with actions |
| TaskFormDialog | Task creation and editing form |
| DeleteDialog | Confirmation dialog for task deletion |

### User Journey Flow

```mermaid
flowchart TD
    Start[User Visits App] --> Check{Authenticated?}
    
    Check -->|No| Landing[Landing Page]
    Landing --> Demo[Demo Login]
    Landing --> Google[Google Sign In]
    
    Demo --> EnterEmail[Enter Email]
    EnterEmail --> CreateUser[Find or Create User]
    CreateUser --> Dashboard
    
    Google --> GoogleOAuth[Google OAuth Flow]
    GoogleOAuth --> GetUser[Get or Create User]
    GetUser --> Dashboard
    
    Check -->|Yes| Dashboard[Dashboard View]
    
    Dashboard --> CreateTask[Create Task]
    Dashboard --> EditTask[Edit Task]
    Dashboard --> DeleteTask[Delete Task]
    Dashboard --> AssignTask[Assign Task]
    Dashboard --> Logout[Sign Out]
    
    CreateTask --> SaveDB[(Save to Database)]
    EditTask --> UpdateDB[(Update Database)]
    DeleteTask --> RemoveDB[(Remove from Database)]
    AssignTask --> NotifyUser[Notify Assignee via Socket]
    
    SaveDB --> Dashboard
    UpdateDB --> Dashboard
    RemoveDB --> Dashboard
    NotifyUser --> Dashboard
    Logout --> Landing
```

---

## State Management

### Zustand Store Architecture

```mermaid
flowchart TD
    subgraph Store State
        S1[tasks: Task Array]
        S2[isLoading: boolean]
        S3[error: string or null]
    end
    
    subgraph Store Actions
        A1[setTasks - Replace all tasks]
        A2[addTask - Add single task]
        A3[updateTask - Update existing task]
        A4[removeTask - Delete task]
        A5[setLoading - Toggle loading state]
        A6[setError - Set error message]
    end
    
    subgraph React Components
        C1[TaskBoard - Reads tasks]
        C2[TaskCard - Reads single task]
        C3[TaskForm - Calls addTask]
    end
    
    subgraph API Layer
        API1[fetchTasks - Calls setTasks]
        API2[createTask - Calls addTask]
        API3[updateTask - Calls updateTask]
        API4[deleteTask - Calls removeTask]
    end
    
    C1 --> S1
    C2 --> S1
    C3 --> A2
    
    API1 --> A1
    API2 --> A2
    API3 --> A3
    API4 --> A4
```

### Data Flow Pattern

The application follows a unidirectional data flow:

1. **User Action:** User interacts with a component
2. **API Call:** Component triggers API request
3. **Store Update:** API response updates Zustand store
4. **UI Re-render:** React components re-render with new state

---

## Deployment Guide

### Deployment Architecture Overview

```mermaid
graph TB
    subgraph Development
        DEV[Local Development Environment]
        GIT[Git Version Control]
    end
    
    subgraph Version Control
        GH[GitHub Repository]
    end
    
    subgraph Production Frontend
        VC[Vercel Hosting]
        CDN[Vercel CDN]
        EDGE[Edge Functions]
    end
    
    subgraph Production Backend
        RW[Railway Hosting]
        SOCK[Socket.io Server]
    end
    
    subgraph Production Database
        SB[Supabase]
        PG[(PostgreSQL)]
    end
    
    subgraph External Services
        GCP[Google Cloud Platform]
        OAUTH[OAuth 2.0 Service]
    end
    
    DEV --> GIT
    GIT --> GH
    GH --> VC
    GH --> RW
    
    VC --> CDN
    VC --> EDGE
    RW --> SOCK
    
    VC --> PG
    SOCK --> PG
    PG --> SB
    
    VC --> OAUTH
    OAUTH --> GCP
```

### Step-by-Step Deployment Process

```mermaid
flowchart TD
    subgraph Step 1 - Database
        S1A[Create Supabase Account]
        S1B[Create New Project]
        S1C[Get Connection String]
        S1D[Run Database Migrations]
    end
    
    subgraph Step 2 - OAuth
        S2A[Access Google Cloud Console]
        S2B[Create OAuth Client]
        S2C[Configure Redirect URIs]
        S2D[Obtain Client Credentials]
    end
    
    subgraph Step 3 - Frontend
        S3A[Push Code to GitHub]
        S3B[Connect Vercel to GitHub]
        S3C[Configure Environment Variables]
        S3D[Deploy Application]
    end
    
    subgraph Step 4 - Socket Service
        S4A[Create Socket Service Repository]
        S4B[Deploy to Railway]
        S4C[Set CORS Origin Variable]
        S4D[Obtain Socket URL]
    end
    
    subgraph Step 5 - Integration
        S5A[Add Socket URL to Vercel]
        S5B[Update Google OAuth URLs]
        S5C[Test All Features]
        S5D[Monitor Application Logs]
    end
    
    S1A --> S1B --> S1C --> S1D
    S2A --> S2B --> S2C --> S2D
    S3A --> S3B --> S3C --> S3D
    S4A --> S4B --> S4C --> S4D
    S5A --> S5B --> S5C --> S5D
    
    S1D --> S3C
    S2D --> S3C
    S3D --> S5A
    S4D --> S5A
```

### Environment Variables

**Vercel Environment Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@host:5432/db |
| GOOGLE_CLIENT_ID | Google OAuth client ID | xxx.apps.googleusercontent.com |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret | GOCSPX-xxxx |
| NEXTAUTH_URL | Application URL | https://your-app.vercel.app |
| NEXTAUTH_SECRET | JWT encryption secret | random-32-char-string |
| NEXT_PUBLIC_SOCKET_URL | Socket server URL | https://socket.railway.app |

**Railway Environment Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 3003 |
| CORS_ORIGIN | Allowed origin | https://your-app.vercel.app |

### Deployment Verification Checklist

| Check | Description |
|-------|-------------|
| Database Connection | Verify Prisma can connect to PostgreSQL |
| Google OAuth | Test sign-in flow completes successfully |
| Task CRUD | Create, update, and delete tasks |
| Real-time Updates | Verify socket connection and live updates |
| Responsive Design | Test on mobile, tablet, and desktop |

---

## Local Development

### Prerequisites

- Node.js 18 or higher, or Bun runtime
- PostgreSQL database (or use SQLite for development)
- Google Cloud account for OAuth credentials

### Setup Instructions

```bash
# Clone the repository
git clone https://github.com/anshsharmacse/taskflow.git
cd taskflow

# Install dependencies
bun install

# Create environment file
cp .env.example .env

# Configure environment variables
# Edit .env with your credentials

# Initialize database
bun run db:push

# Start development server
bun run dev

# In separate terminal, start socket service
cd mini-services/task-socket
bun install
bun run dev
```

### Environment Variables Template

```env
# Database
DATABASE_URL="file:./dev.db"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key"

# Socket Service (optional for local dev)
NEXT_PUBLIC_SOCKET_URL=""
```

### Project Structure

```
taskflow/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   ├── logo.svg               # Application logo
│   └── favicon.svg            # Browser favicon
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Authentication routes
│   │   │   └── tasks/         # Task API routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main application page
│   ├── components/
│   │   ├── tasks/             # Task-related components
│   │   ├── ui/                # UI primitive components
│   │   └── providers/         # Context providers
│   ├── hooks/
│   │   ├── use-task-socket.ts # Socket connection hook
│   │   ├── use-toast.ts       # Toast notification hook
│   │   └── use-mobile.ts      # Mobile detection hook
│   └── lib/
│       ├── auth.ts            # NextAuth configuration
│       ├── db.ts              # Prisma client instance
│       ├── store/             # Zustand store
│       └── utils.ts           # Utility functions
├── mini-services/
│   └── task-socket/           # Socket.io service
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Testing

### Test Strategy Overview

```mermaid
graph TB
    subgraph Unit Tests
        U1[Store Actions]
        U2[Utility Functions]
        U3[Validation Schemas]
    end
    
    subgraph Integration Tests
        I1[API Route Handlers]
        I2[Database Operations]
        I3[Authentication Flow]
    end
    
    subgraph End-to-End Tests
        E1[User Registration Flow]
        E2[Task CRUD Operations]
        E3[Real-time Updates]
    end
    
    U1 --> Report[Coverage Report]
    U2 --> Report
    U3 --> Report
    I1 --> Report
    I2 --> Report
    I3 --> Report
    E1 --> Report
    E2 --> Report
    E3 --> Report
```

### Test Coverage Summary

| Component | Coverage | Description |
|-----------|----------|-------------|
| Task Store | 85% | Zustand store operations tested |
| API Routes | 70% | CRUD operations covered |
| Auth Flow | 60% | Core authentication paths tested |

### Running Tests

```bash
# Execute all tests
bun test

# Run specific test file
bun test src/lib/store/task-store.test.ts

# Generate coverage report
bun test --coverage
```

---

## AI Usage Disclosure

### AI Tools Utilized

| Task | AI Tool | Purpose |
|------|---------|---------|
| Boilerplate Code | Claude AI | Initial component scaffolding and structure |
| Debugging | Claude AI | Error analysis and solution recommendations |
| Architecture Planning | Claude AI | System design discussions and decisions |
| Documentation | Claude AI | README structure and diagram generation |

### Manual Review and Modifications

| Area | Changes Made |
|------|--------------|
| Authentication | Rewrote callbacks to handle Google OAuth without PrismaAdapter |
| Socket Connection | Added graceful fallback when socket service unavailable |
| Error Handling | Enhanced error messages with user-friendly descriptions |
| UI Styling | Customized color scheme and removed external branding |
| Database | Created manual migration scripts for Supabase compatibility |

### Disagreement with AI Output Example

**AI Suggestion:** Use PrismaAdapter for NextAuth.js authentication

```typescript
// AI recommended approach
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  // ...
}
```

**My Decision:** Implement custom callbacks without PrismaAdapter

```typescript
// My implementation
export const authOptions: NextAuthOptions = {
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        });
        if (!existingUser) {
          await db.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: account.providerAccountId,
              emailVerified: new Date(),
            },
          });
        }
      }
      return true;
    },
  },
}
```

**Reasoning:** The PrismaAdapter requires additional database tables (accounts, sessions, verification_tokens) that added complexity without clear benefit for this use case. Custom callbacks provide more control over user creation logic and reduce database dependencies.

---

## Assumptions and Trade-offs

### Assumptions Made During Development

| Assumption | Rationale |
|------------|-----------|
| Users have Google accounts | Primary authentication method is Google OAuth |
| Single organization context | No multi-tenant support required |
| Email as unique identifier | Email addresses are used for task assignment |
| Soft real-time requirements | Brief delays in updates are acceptable |

### Technical Trade-offs

```mermaid
graph LR
    subgraph Implemented Approach
        A[JWT Sessions]
        B[Socket.io]
        C[PostgreSQL]
        D[Dual Deployment]
    end
    
    subgraph Alternative Approaches
        A2[Database Sessions]
        B2[HTTP Polling]
        C2[MongoDB]
        D2[Single Platform]
    end
    
    subgraph Trade-off Analysis
        T1[Stateless vs Revocable]
        T2[Real-time vs Simple]
        T3[Relations vs Flexibility]
        T4[Features vs Convenience]
    end
    
    A -.-> T1
    A2 -.-> T1
    B -.-> T2
    B2 -.-> T2
    C -.-> T3
    C2 -.-> T3
    D -.-> T4
    D2 -.-> T4
```

### Trade-off Details

| Decision | Trade-off | Reasoning |
|----------|-----------|-----------|
| JWT Sessions | Cannot instantly revoke sessions | Stateless approach scales better and simplifies setup |
| Socket.io over WebSockets | Larger bundle size | Provides auto-reconnection, fallback polling, and room support |
| PostgreSQL over MongoDB | Less flexible schema | Strong relational model for user-task relationships, ACID compliance |
| Dual Platform Deployment | More complex setup | Vercel does not natively support persistent WebSocket connections |
| No PrismaAdapter | Manual user handling | Avoids extra database tables and provides more control |

---

## Known Limitations

### Current Limitations Overview

```mermaid
mindmap
  root((Limitations))
    Authentication
      No multi-factor authentication
      No password-based login option
      Sessions cannot be revoked instantly
    Real-time
      Socket service required separately
      No offline support
      Connection drops require page refresh
    Task Management
      No due date reminders
      No file attachments
      No task comments
      No subtask support
    Team Features
      No team management
      No permission levels
      No bulk operations
```

### Limitation Details

| Limitation | Impact | Potential Solution |
|------------|--------|-------------------|
| No MFA Support | Reduced security for sensitive use cases | Implement TOTP or SMS verification |
| Socket Service Dependency | Real-time breaks without socket service | Add offline-first with sync queue |
| No Task Reminders | Tasks may be forgotten | Integrate push notification API |
| No File Attachments | Limited context for tasks | Add S3-compatible storage integration |
| No Comments | No discussion capability | Add comments table with relations |
| No Subtasks | Complex tasks harder to manage | Implement self-referential task relations |

---

## Future Improvements

### Development Roadmap

```mermaid
timeline
    title TaskFlow Development Roadmap
    Q2 2026 : Push Notifications
            : Offline Support
            : Task Due Date Reminders
    Q3 2026 : File Attachments
            : Task Comments
            : Subtask Support
    Q4 2026 : Team Management
            : Permission System
            : Analytics Dashboard
```

### Feature Priority Analysis

```mermaid
quadrantChart
    title Feature Priority Analysis
    x-axis Low Effort --> High Effort
    y-axis Low Value --> High Value
    quadrant-1 Do First
    quadrant-2 Nice to Have
    quadrant-3 Consider Later
    quadrant-4 Avoid For Now
    Push Notifications: 0.3, 0.8
    Offline Support: 0.7, 0.9
    Task Comments: 0.4, 0.7
    File Attachments: 0.6, 0.6
    Team Management: 0.8, 0.8
    Analytics: 0.5, 0.5
    Subtasks: 0.5, 0.7
```

### Proposed Architecture Improvements

```mermaid
graph TB
    subgraph Current Architecture
        C1[Monolithic Frontend]
        C2[Single Socket Server]
        C3[Single Database Instance]
    end
    
    subgraph Future Architecture
        F1[Micro-frontends]
        F2[Socket Cluster]
        F3[Read Replicas]
        F4[Redis Cache Layer]
        F5[CDN for Static Assets]
        F6[Message Queue]
    end
    
    C1 --> F1
    C2 --> F2
    C3 --> F3
    C3 --> F4
```

---

## Developer

**Ansh Sharma**

National Institute of Technology Calicut

**GitHub:** [github.com/anshsharmacse](https://github.com/anshsharmacse)

---

## License

This project is licensed under the MIT License.

---

Built with Next.js, Prisma, and Socket.io
