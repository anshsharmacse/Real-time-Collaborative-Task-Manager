# TaskFlow

# Real-time Collaborative Task Manager

<div align="center">
<img width="1881" height="862" alt="TaskFlow Dashboard" src="https://github.com/user-attachments/assets/35dee6bc-688c-4d00-aaf2-1ffa5d6ee516" />


### A modern, production-ready collaborative task management application

### Featuring real-time updates, Google authentication, and seamless task assignment

---

## Deployed Link

### [https://taskflow-fawn-si.vercel.app](https://taskflow-fawn-psi.vercel.app)

### Click the link above to try the application now

---

**Socket Service:** [https://github.com/anshsharmacse/taskflow-socket](https://github.com/anshsharmacse/taskflow-socket)

**Source Code:** [https://github.com/anshsharmacse/Real-time-Collaborative-Task-Manager](https://github.com/anshsharmacse/Real-time-Collaborative-Task-Manager)

---

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)
![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=for-the-badge&logo=socket.io)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)

</div>

---

## Quick Start Guide

### Try the app in 30 seconds

1. Open [https://taskflow-fawn-psi.vercel.app](https://taskflow-fawn-psi.vercel.app)
2. Click **"Demo Login"** or **Sign in using your Google Account**
3. Enter any email address (e.g., `demo@example.com`) for Demo Login
4. Start creating and assigning tasks instantly
5. Change task status using the **toggle** button - updates reflect immediately

<img width="1895" height="896" alt="TaskFlow Application Interface" src="https://github.com/user-attachments/assets/322dde47-a73c-44d7-909d-ada2edc7c008" />

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features Showcase](#features-showcase)
- [System Architecture](#system-architecture)
- [Tech Stack Decisions](#tech-stack-decisions)
- [Database Design](#database-design)
- [Authentication System](#authentication-system)
- [Real-time Architecture](#real-time-architecture)
- [API Documentation](#api-documentation)
- [UI Component Design](#ui-component-design)
- [State Management](#state-management)
- [Deployment Guide](#deployment-guide)
- [Local Development](#local-development)
- [Testing Strategy](#testing-strategy)
- [AI Usage Disclosure](#ai-usage-disclosure)
- [Assumptions and Trade-offs](#assumptions-and-trade-offs)
- [Known Limitations](#known-limitations)
- [Future Roadmap](#future-roadmap)
- [Developer Information](#developer-information)

---

## Project Overview

### Problem Statement

The objective is to build a Real-time Collaborative Task Manager that demonstrates proficiency in:

- Secure authentication implementation
- Relational database management
- Premium user interface design
- End-to-end deployment
- Real-time communication systems

### Requirements Coverage

| Core Requirement | Implementation Status |
|------------------|----------------------|
| Google Authentication | Fully Implemented |
| Personal To-Do List (CRUD) | Fully Implemented |
| Task Assignment by Email | Fully Implemented |
| Real-time Updates (Bonus) | Fully Implemented |
| Premium UI/UX | Fully Implemented |
| Responsive Design | Fully Implemented |
| Full Deployment | Live in Production |

---

## Features Showcase

### Core Functionality

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Google Authentication** | Secure OAuth 2.0 login flow with Google accounts | NextAuth.js with custom callbacks |
| **Demo Login** | Instant access without external accounts | Credentials provider with auto-registration |
| **Task CRUD** | Create, read, update, and delete tasks | REST API with Prisma ORM |
| **Task Assignment** | Assign tasks to any email address | Email-based linking with fallback storage |
| **Real-time Sync** | Live task updates across clients | Socket.io WebSocket server |
| **Dark Mode** | Full theme switching support | next-themes with system preference |
| **Responsive UI** | Optimized for all screen sizes | Tailwind CSS breakpoints |

### Key Features Explained

**Task Assignment Logic:** Users can assign tasks to anyone by entering their email address. If the assignee already exists in the system, the task immediately appears on their dashboard. If not, the email is stored and linked automatically when that person signs up.

**Real-time Updates:** When a task is created, updated, or deleted, all connected clients receive instant notifications via WebSocket. This ensures everyone sees changes immediately without refreshing the page.

### Feature Interaction Diagram

```mermaid
flowchart LR
    subgraph User Actions
        A1[Create Task]
        A2[Edit Task]
        A3[Delete Task]
        A4[Assign Task]
        A5[Change Status]
    end
    
    subgraph System Response
        S1[Save to Database]
        S2[Notify via Socket]
        S3[Update UI]
    end
    
    A1 --> S1
    A2 --> S1
    A3 --> S1
    A4 --> S1
    A5 --> S1
    S1 --> S2
    S2 --> S3
```

**Feature Flow Explained:** All user actions flow through a consistent pipeline. The system first persists changes to the database, then broadcasts updates via Socket.io, and finally all connected clients update their UI automatically.

---

## System Architecture

### High-Level Architecture Diagram

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

**Architecture Explanation:** The diagram above illustrates the complete system architecture. Users access the application through web browsers (desktop or mobile), which connect to the Next.js frontend hosted on Vercel. The frontend communicates with two backend services: the REST API for standard CRUD operations and the Socket.io server for real-time communication. All data is persisted in a PostgreSQL database hosted on Supabase, while Google handles OAuth authentication.

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

**Flow Explanation:** This sequence diagram shows how a task creation flows through the system. When a user creates a task, the client sends a POST request to the API. The API stores the task in the database and returns the created task. The client then emits a socket event, which the server broadcasts to all relevant users, triggering immediate UI updates on their screens.

### System Components Overview

```mermaid
graph LR
    subgraph "User Interface"
        A[Landing Page]
        B[Dashboard]
        C[Task Board]
        D[User Profile]
    end
    
    subgraph "Core Services"
        E[Authentication Service]
        F[Task Service]
        G[Notification Service]
    end
    
    subgraph "Data Services"
        H[User Repository]
        I[Task Repository]
        J[Session Store]
    end
    
    A --> E
    B --> F
    B --> G
    C --> F
    D --> E
    
    E --> H
    E --> J
    F --> I
    G --> H
```

**Components Explanation:** The system is organized into three main layers. The User Interface layer contains all visible pages and components. The Core Services layer handles business logic for authentication, tasks, and notifications. The Data Services layer manages all database interactions through repository patterns.

### Request Processing Pipeline

```mermaid
flowchart TD
    A[User Request] --> B{Authenticated?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D[Parse Request]
    D --> E[Validate Input]
    E --> F{Valid?}
    F -->|No| G[Return Error]
    F -->|Yes| H[Process Business Logic]
    H --> I[Database Operation]
    I --> J[Emit Socket Event]
    J --> K[Return Response]
    K --> L[UI Update]
```

**Pipeline Explained:** Every request follows a strict processing pipeline. Authentication is checked first, followed by input validation. Valid requests proceed through business logic, database operations, and finally socket notifications before returning the response.

---

## Tech Stack Decisions

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

**Technology Choices Explained:** This mind map visualizes all technology decisions. Each choice was made considering the specific requirements: Next.js for its full-stack capabilities, TypeScript for type safety, Tailwind CSS for rapid UI development, Prisma for database abstraction, and Socket.io for real-time features.

### Complete Technology Stack

| Category | Technology | Version | Justification |
|----------|------------|---------|---------------|
| **Framework** | Next.js | 16.x | App Router provides modern routing patterns and server components |
| **Language** | TypeScript | 5.x | Catches errors at compile time and improves code maintainability |
| **Styling** | Tailwind CSS | 4.x | Rapid UI development with consistent design tokens |
| **UI Library** | shadcn/ui | Latest | Accessible, unstyled components that can be fully customized |
| **Database ORM** | Prisma | 6.x | Type-safe database queries with automatic TypeScript generation |
| **Database** | PostgreSQL | 15.x | ACID-compliant relational database with excellent performance |
| **Authentication** | NextAuth.js | 4.x | Industry-standard OAuth implementation with session management |
| **Real-time** | Socket.io | 4.x | Reliable WebSocket with automatic reconnection and fallbacks |
| **State Management** | Zustand | 5.x | Lightweight and simple global state without boilerplate |
| **Animations** | Framer Motion | 12.x | Declarative animations with excellent React integration |
| **Form Handling** | React Hook Form | 7.x | Performant forms with minimal re-renders |
| **Validation** | Zod | 4.x | TypeScript-first schema validation with type inference |

### Technology Stack Layers

```mermaid
graph TB
    subgraph "Presentation Layer"
        P1[Tailwind CSS]
        P2[shadcn/ui Components]
        P3[Framer Motion]
    end
    
    subgraph "Application Layer"
        A1[Next.js App Router]
        A2[React Components]
        A3[Server Actions]
    end
    
    subgraph "Business Layer"
        B1[NextAuth.js]
        B2[Zustand Store]
        B3[API Routes]
    end
    
    subgraph "Data Layer"
        D1[Prisma ORM]
        D2[PostgreSQL]
        D3[Socket.io]
    end
    
    P1 --> A1
    P2 --> A2
    P3 --> A2
    A1 --> B1
    A2 --> B2
    A3 --> B3
    B1 --> D1
    B2 --> D3
    B3 --> D1
    D1 --> D2
```

**Layer Architecture Explained:** The application follows a layered architecture pattern. The presentation layer handles visual rendering, the application layer manages component logic, the business layer implements core functionality, and the data layer handles persistence and real-time communication.

---

## Database Design

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ TASK : creates
    USER ||--o{ TASK : is_assigned_to

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
        string status
        string priority
        datetime dueDate
        string creatorId FK
        string assigneeId FK
        string assigneeEmail
        datetime createdAt
        datetime updatedAt
        datetime completedAt
    }
```

**Database Schema Explanation:** The database consists of two primary tables. The User table stores account information including Google OAuth identifiers. The Task table contains all task data with foreign key relationships to both the creator and optional assignee. The `assigneeEmail` field is crucial: it allows task assignment to users who have not registered yet, with automatic linking when they sign up.

### Task Status State Machine

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

**Status Transitions Explained:** Tasks follow a defined lifecycle. New tasks start in PENDING state, can move to IN_PROGRESS when work begins, and finally to COMPLETED. Users can reopen completed tasks or move in-progress tasks back to pending. Any task can be deleted from any state.

### Task Priority Flow

```mermaid
flowchart LR
    subgraph Priority Levels
        L[LOW - Green]
        M[MEDIUM - Yellow]
        H[HIGH - Red]
    end
    
    subgraph Visual Indicators
        V1[Subtle Badge]
        V2[Standard Badge]
        V3[Prominent Badge]
    end
    
    L --> V1
    M --> V2
    H --> V3
```

**Priority System Explained:** Tasks are categorized into three priority levels. Low priority tasks appear with a subtle green indicator, medium priority with a standard yellow indicator, and high priority tasks display a prominent red indicator for immediate attention.

### Database Performance Optimization

```sql
-- User table indexes for fast lookups
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_googleId_idx ON users("googleId");

-- Task table indexes for efficient queries
CREATE INDEX tasks_creatorId_idx ON tasks("creatorId");
CREATE INDEX tasks_assigneeId_idx ON tasks("assigneeId");
CREATE INDEX tasks_status_idx ON tasks(status);
CREATE INDEX tasks_priority_idx ON tasks(priority);
```

**Index Strategy Explained:** These indexes optimize the most common query patterns. The email index enables fast user lookups during authentication and task assignment. The foreign key indexes speed up JOIN operations when fetching tasks with their related users.

### Data Access Patterns

```mermaid
flowchart TD
    subgraph "Read Patterns"
        R1[User Tasks by Creator]
        R2[User Tasks by Assignee]
        R3[Task by ID]
    end
    
    subgraph "Write Patterns"
        W1[Create Task]
        W2[Update Status]
        W3[Delete Task]
    end
    
    subgraph "Index Usage"
        I1[creatorId Index]
        I2[assigneeId Index]
        I3[Primary Key]
    end
    
    R1 --> I1
    R2 --> I2
    R3 --> I3
    W1 --> I1
    W2 --> I3
    W3 --> I3
```

**Access Patterns Explained:** The diagram shows how different operations utilize database indexes. Read operations leverage indexes for fast retrieval, while write operations use appropriate indexes for efficient updates. This design ensures consistent performance as data grows.

---

## Authentication System

### Google OAuth Flow

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

**OAuth Flow Explained:** When a user clicks "Sign in with Google," they are redirected to Google's OAuth consent screen. After granting permission, Google returns an authorization code which NextAuth exchanges for an access token. The system then creates or updates the user record and establishes a JWT session stored in an HTTP-only cookie.

### Demo Login Flow

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

**Demo Login Explained:** The demo login provides instant access for testing. Users enter any email address, and the system either finds an existing account or creates a new one automatically. This eliminates friction for users who want to try the app without connecting their Google account.

### Session Management Strategy

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

**Session Strategy Explained:** The application uses JWT-based sessions instead of database sessions. This approach is stateless, meaning the server does not need to store session data. The JWT contains the user ID and email, signed with a secret key. Each request includes the token in an HTTP-only cookie for security.

### Authentication Decision Flow

```mermaid
flowchart TD
    A[User Visits App] --> B{Has Session Cookie?}
    B -->|No| C[Show Landing Page]
    C --> D{Choose Auth Method}
    D -->|Google| E[Google OAuth Flow]
    D -->|Demo| F[Demo Login Flow]
    E --> G[Create/Update User]
    F --> G
    G --> H[Generate JWT]
    H --> I[Set Cookie]
    I --> J[Redirect to Dashboard]
    B -->|Yes| K{Validate JWT}
    K -->|Valid| J
    K -->|Invalid| C
```

**Auth Decision Flow Explained:** This flowchart shows the complete authentication decision process. Users without a valid session see the landing page and choose their authentication method. After successful authentication, a JWT is generated and stored as a cookie before redirecting to the dashboard.

---

## Real-time Architecture

### Socket.io Connection Lifecycle

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

**Connection Lifecycle Explained:** When a user opens the app, the client establishes a WebSocket connection to the Socket.io server. After connection, the client sends authentication details. The server registers the user in rooms based on their ID and email. When events occur, the server broadcasts to relevant rooms, and clients update their UI in real-time.

### Socket Event Architecture

<img width="1728" height="467" alt="image" src="https://github.com/user-attachments/assets/8f5c53df-6777-472e-a886-edcfbc23c86d" />


```mermaid
flowchart TD
    subgraph Client to Server Events
        C1[task created]
        C2[task updated]
        C3[task deleted]
        C4[authenticate]
    end
    
    subgraph Server to Client Events
        S1[task assigned]
        S2[task updated broadcast]
        S3[task deleted broadcast]
        S4[authenticated confirm]
    end
    
    C1 --> S1
    C2 --> S2
    C3 --> S3
    C4 --> S4
```

**Event System Explained:** The socket communication uses a bidirectional event system. Clients emit events for actions they perform, and the server broadcasts events to notify relevant users. This architecture ensures only affected users receive notifications, reducing unnecessary network traffic.

### Room-based Broadcasting

```mermaid
flowchart LR
    subgraph User Rooms
        R1[Room: user/userId]
        R2[Room: email/userEmail]
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

**Room System Explained:** Each user joins two rooms when they connect: one based on their user ID and one based on their email address. This dual-room system ensures task assignment by email works correctly, even for users who have not registered yet. When they sign up, they immediately receive their assigned tasks.

### Real-time Update Scenarios

| Scenario | Event Emitted | Who Receives Notification |
|----------|---------------|---------------------------|
| Task Created | `task:created` | Assignee (if email provided) |
| Task Updated | `task:updated` | Creator and Assignee |
| Task Deleted | `task:deleted` | Assignee (if exists) |
| Status Changed | `task:updated` | All stakeholders |

### Real-time Data Flow

```mermaid
flowchart TD
    subgraph "Event Trigger"
        T1[User Creates Task]
    end
    
    subgraph "Processing"
        P1[API Saves to DB]
        P2[Client Emits Socket Event]
        P3[Server Receives Event]
    end
    
    subgraph "Broadcasting"
        B1[Find Target Rooms]
        B2[Emit to Each Room]
    end
    
    subgraph "Client Update"
        C1[Receive Event]
        C2[Update Local State]
        C3[Re-render UI]
    end
    
    T1 --> P1
    T1 --> P2
    P1 --> P3
    P2 --> P3
    P3 --> B1
    B1 --> B2
    B2 --> C1
    C1 --> C2
    C2 --> C3
```

**Real-time Flow Explained:** This diagram shows the complete flow of real-time updates. When a user creates a task, the API saves it to the database while the client simultaneously emits a socket event. The server receives the event, determines target rooms, and broadcasts to all relevant clients who then update their UI.

---

## API Documentation

### RESTful Endpoint Overview

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

**API Structure Explained:** The API follows RESTful conventions with two main resource groups. Authentication endpoints handle user sessions and OAuth callbacks. Task endpoints provide full CRUD operations for task management.

### Request-Response Flow

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

**Request Pipeline Explained:** Every API request passes through middleware that validates authentication. Authenticated requests proceed to route handlers which validate input using Zod schemas. Valid requests execute database operations through Prisma and return appropriate responses.

### Endpoint Specifications

#### GET /api/tasks

Retrieves all tasks visible to the authenticated user.

| Field | Type | Description |
|-------|------|-------------|
| tasks | Array | List of tasks created by or assigned to the user |

#### POST /api/tasks

Creates a new task with optional assignment.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Task title, 1-100 characters |
| description | string | No | Task description, max 500 characters |
| priority | enum | No | LOW, MEDIUM, or HIGH, defaults to MEDIUM |
| dueDate | Date | No | Task due date in ISO format |
| assigneeEmail | email | No | Email address of assignee |

#### PUT /api/tasks/:id

Updates an existing task. Only provided fields are updated.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | Updated title |
| description | string | No | Updated description |
| status | enum | No | PENDING, IN_PROGRESS, or COMPLETED |
| priority | enum | No | Updated priority level |
| dueDate | Date | No | Updated due date |
| assigneeEmail | email | No | New or removed assignee |

#### DELETE /api/tasks/:id

Permanently removes a task from the database.

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Task ID to delete |

### API Response Codes

```mermaid
flowchart LR
    subgraph Success Codes
        S1[200 OK - Get/Update]
        S2[201 Created - POST]
    end
    
    subgraph Client Error Codes
        E1[400 Bad Request]
        E2[401 Unauthorized]
        E3[404 Not Found]
    end
    
    subgraph Server Error Codes
        E4[500 Internal Error]
    end
```

**Response Codes Explained:** The API uses standard HTTP status codes. Success responses return 200 or 201 depending on the operation. Client errors indicate invalid requests, authentication issues, or missing resources. Server errors indicate unexpected backend failures.

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

**Component Architecture Explained:** The UI follows a hierarchical structure. The root layout provides global providers for session and theme management. Page components compose shared components like Header and Footer with feature-specific components. Task components are built from primitive UI components from shadcn/ui, ensuring consistent styling and accessibility.

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

**User Flow Explained:** This diagram maps every possible user journey through the application. Unauthenticated users see the landing page and can choose between demo login or Google authentication. Once authenticated, users access the dashboard where they can perform all task operations. Each action updates the database and, where relevant, notifies other users in real-time.

### Component State Flow

```mermaid
flowchart TD
    subgraph "User Interaction"
        U1[Click Create Button]
        U2[Fill Form]
        U3[Submit Form]
    end
    
    subgraph "Component State"
        C1[Open Dialog]
        C2[Validate Input]
        C3[Loading State]
        C4[Success/Error]
    end
    
    subgraph "Store Update"
        S1[Call API]
        S2[Update Zustand Store]
        S3[Trigger Re-render]
    end
    
    U1 --> C1
    C1 --> U2
    U2 --> U3
    U3 --> C2
    C2 --> C3
    C3 --> S1
    S1 --> S2
    S2 --> S3
    S3 --> C4
```

**State Flow Explained:** This diagram shows how user interactions flow through component state. When a user interacts with the UI, components update their local state, call APIs, update the global store, and finally reflect changes in the UI.

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

**State Management Explained:** The application uses Zustand for global state management with a simple, flat store structure. The store holds the task list and UI state (loading, error). Actions provide the only way to modify state, ensuring predictable updates. Components read state directly and call actions through event handlers.

### Data Flow Pattern

1. **User Action:** User clicks a button or submits a form
2. **API Call:** Component invokes API service function
3. **Response Handling:** API response updates the Zustand store
4. **UI Update:** React re-renders affected components automatically

### State Synchronization

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant Store
    participant API
    participant Socket
    
    User->>Component: Create Task
    Component->>API: POST /api/tasks
    API-->>Component: Task Response
    Component->>Store: addTask
    Store-->>Component: State Updated
    Component->>Socket: Emit created event
    Socket-->>Component: Broadcast to others
```

**Synchronization Explained:** State synchronization follows a dual-path approach. The primary path updates the store immediately after API success. The secondary path uses sockets to keep other clients in sync. This ensures all users see consistent state.

---

## Deployment Guide

### Production Architecture

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

**Deployment Architecture Explained:** The production deployment uses multiple services. Vercel hosts the Next.js frontend with CDN and edge functions. Railway runs the separate Socket.io server for WebSocket support. Supabase provides the managed PostgreSQL database. Google Cloud handles OAuth authentication.

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

**Deployment Process Explained:** The deployment follows five sequential phases. First, set up the database on Supabase. Second, configure Google OAuth credentials. Third, deploy the frontend to Vercel. Fourth, deploy the socket service to Railway. Finally, connect all services and verify functionality.

### Environment Variables Reference

**Required for Vercel Deployment:**

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string with pgbouncer | `postgresql://user:pass@host:5432/db?pgbouncer=true` |
| `DIRECT_DATABASE_URL` | Direct connection for migrations | `postgresql://user:pass@host:5432/postgres` |
| `GOOGLE_CLIENT_ID` | Google OAuth client identifier | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-xxxx` |
| `NEXTAUTH_URL` | Production application URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | JWT encryption key | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket server public URL | `https://socket.railway.app` |

**Required for Railway Socket Service:**

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server listening port | `3003` |
| `CORS_ORIGIN` | Allowed frontend origin | `https://your-app.vercel.app` |

### CI/CD Pipeline

```mermaid
flowchart LR
    subgraph "Source Control"
        A[Git Push]
    end
    
    subgraph "CI Pipeline"
        B[Lint Check]
        C[Type Check]
        D[Build Test]
    end
    
    subgraph "CD Pipeline"
        E[Vercel Deploy]
        F[Railway Deploy]
    end
    
    subgraph "Verification"
        G[Health Check]
        H[Smoke Tests]
    end
    
    A --> B --> C --> D --> E
    D --> F
    E --> G
    F --> G
    G --> H
```

**Pipeline Explained:** The CI/CD pipeline ensures code quality before deployment. Every push triggers lint and type checks, followed by a build test. Successful builds deploy automatically to Vercel and Railway, followed by health checks and smoke tests.

---

## Local Development

### Prerequisites

| Requirement | Minimum Version | Purpose |
|-------------|-----------------|---------|
| Node.js or Bun | 18.x / Latest | JavaScript runtime |
| PostgreSQL | 15.x | Local database (optional) |
| Git | Latest | Version control |

### Quick Start Commands

```bash
# Clone the repository
git clone https://github.com/anshsharmacse/Real-time-Collaborative-Task-Manager.git
cd Real-time-Collaborative-Task-Manager

# Install dependencies
bun install

# Create environment configuration
cp .env.example .env

# Configure your credentials in .env
# DATABASE_URL="file:./dev.db" (for SQLite)
# GOOGLE_CLIENT_ID="your-client-id"
# GOOGLE_CLIENT_SECRET="your-client-secret"
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="your-secret"

# Initialize the database
bun run db:push

# Start the development server
bun run dev

# In a separate terminal, start the socket service
cd mini-services/task-socket
bun install
bun run dev
```

### Project Directory Structure

```
taskflow/
├── prisma/
│   └── schema.prisma          # Database schema definition
├── public/
│   ├── logo.svg               # Application logo
│   └── favicon.svg            # Browser favicon
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   └── tasks/         # Task CRUD endpoints
│   │   ├── globals.css        # Global Tailwind styles
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Main application page
│   ├── components/
│   │   ├── tasks/             # Task-related React components
│   │   ├── ui/                # shadcn/ui primitive components
│   │   └── providers/         # Context providers
│   ├── hooks/
│   │   ├── use-task-socket.ts # WebSocket connection hook
│   │   ├── use-toast.ts       # Toast notification hook
│   │   └── use-mobile.ts      # Mobile detection hook
│   └── lib/
│       ├── auth.ts            # NextAuth.js configuration
│       ├── db.ts              # Prisma client singleton
│       ├── store/             # Zustand state store
│       └── utils.ts           # Utility functions
├── mini-services/
│   └── task-socket/           # Standalone Socket.io service
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

### Development Workflow

```mermaid
flowchart TD
    A[Clone Repository] --> B[Install Dependencies]
    B --> C[Configure Environment]
    C --> D[Initialize Database]
    D --> E[Start Development Server]
    E --> F[Make Changes]
    F --> G{Tests Pass?}
    G -->|Yes| H[Commit Changes]
    G -->|No| F
    H --> I[Push to GitHub]
    I --> J[CI Pipeline Runs]
    J --> K[Deploy to Preview]
```

**Workflow Explained:** Local development follows a standard Git workflow. After setup, developers make changes, run tests locally, commit, and push. The CI pipeline validates changes before deploying to a preview environment for final verification.

---

## Testing Strategy

### Test Coverage Overview

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

**Testing Approach Explained:** The testing strategy covers three levels. Unit tests verify individual functions and store logic in isolation. Integration tests validate API endpoints with database interactions. End-to-end tests confirm complete user flows from UI interaction to database persistence.

### Coverage Summary

| Component | Coverage | Description |
|-----------|----------|-------------|
| Task Store | 85% | Zustand store actions and state management |
| API Routes | 70% | REST endpoints for task operations |
| Authentication | 60% | OAuth and demo login flows |

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test src/lib/store/task-store.test.ts

# Generate coverage report
bun test --coverage
```

### Test Pyramid

```mermaid
graph BT
    subgraph "Test Pyramid"
        A[Unit Tests - Many Fast Tests]
        B[Integration Tests - Moderate Tests]
        C[E2E Tests - Few Slow Tests]
    end
    
    A --> B --> C
```

**Test Pyramid Explained:** The test pyramid illustrates the ideal test distribution. Unit tests form the base with many fast, isolated tests. Integration tests are fewer and slower. E2E tests are the fewest and slowest but provide the highest confidence in user-facing functionality.

---

## AI Usage Disclosure

### AI Tool Utilized

**Tool:** GLM (General Language Model) by Z

This project was developed with assistance from the GLM model, a large language model specialized for code generation and technical assistance.

### What AI Was Used For

| Task Category | AI Contribution |
|---------------|-----------------|
| Boilerplate Code | Initial component scaffolding and project structure setup |
| Debugging | Error analysis, solution recommendations, and deployment troubleshooting |
| Architecture Planning | System design discussions and technology selection guidance |
| Documentation | README structure, Mermaid diagrams, and technical writing |
| Code Review | Identifying potential issues and suggesting improvements |

### What Was Manually Reviewed and Changed

| Area | Manual Modifications |
|------|----------------------|
| Authentication | Completely rewrote NextAuth callbacks to handle Google OAuth without PrismaAdapter dependency |
| Socket Connection | Implemented graceful fallback handling when socket service is unavailable |
| Error Handling | Enhanced all error messages with user-friendly descriptions |
| UI Styling | Customized entire color scheme and removed all external branding references |
| Database | Created manual migration scripts optimized for Supabase PostgreSQL |
| Security | Validated all environment variable handling and authentication flows |

### Example of Disagreement with AI Output

**AI Suggestion:**

```typescript
// AI recommended using PrismaAdapter for authentication
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [GoogleProvider({...})],
}
```

**My Implementation:**

```typescript
// I chose to implement custom callbacks instead
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Custom user creation/update logic
      if (account?.provider === "google" && user.email) {
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        });
        if (!existingUser) {
          await db.user.create({
            data: {
              email: user.email,
              name: user.name || user.email.split("@")[0],
              image: user.image,
              googleId: account.providerAccountId,
              emailVerified: new Date(),
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      if (!token.id && token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email as string },
        });
        if (dbUser) token.id = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
}
```

**Reasoning for Disagreement:**

The PrismaAdapter requires additional database tables (`accounts`, `sessions`, `verification_tokens`) that would increase complexity without providing clear benefits for this use case. Custom callbacks offer:

1. **Full Control:** Complete visibility into user creation and session management
2. **Fewer Dependencies:** No extra database tables to maintain
3. **Simpler Migrations:** Eager user creation on first sign-in
4. **Better Debugging:** Clear understanding of authentication flow during development and deployment

This decision proved valuable during deployment when debugging authentication issues, as I had complete control over the callback logic.

### AI Assistance Breakdown

<img width="629" height="381" alt="image" src="https://github.com/user-attachments/assets/492b47d3-c22c-4796-ad7f-b3ffcee7478d" />

**Contribution Breakdown Explained:** The pie chart shows the distribution of AI assistance across different development activities. Boilerplate code generation received the most assistance, followed by debugging help and documentation. Architecture planning and code review received targeted assistance for complex decisions.

---

## Assumptions and Trade-offs

### Development Assumptions

| Assumption | Rationale |
|------------|-----------|
| Users have Google accounts | Primary authentication is Google OAuth, with demo login as fallback |
| Single organization context | No multi-tenant support required for this use case |
| Email as unique identifier | Email addresses are natural keys for user identification and task assignment |
| Soft real-time requirements | Brief delays in updates (seconds) are acceptable for collaborative task management |

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

**Trade-off Decisions Explained:** Each technical choice involved trade-offs. JWT sessions are stateless but cannot be instantly revoked. Socket.io adds complexity but enables true real-time updates. PostgreSQL requires defined schemas but provides strong relational integrity. Dual deployment separates concerns but increases operational complexity.

### Detailed Trade-off Analysis

| Decision | Trade-off Made | Justification |
|----------|----------------|---------------|
| JWT Sessions | Cannot revoke sessions instantly | Stateless approach scales better and eliminates database session storage |
| Socket.io over raw WebSockets | Larger bundle size | Provides auto-reconnection, fallback to polling, and room-based broadcasting |
| PostgreSQL over MongoDB | Less flexible schema | Strong relational model fits user-task relationships, ACID compliance critical for data integrity |
| Dual Platform (Vercel + Railway) | More deployment steps | Vercel does not support persistent WebSocket connections natively |
| Custom Auth Callbacks | More code to maintain | Avoids PrismaAdapter dependencies and provides full control |

### Decision Impact Matrix
```mermaid
flowchart TB
    A["Architecture Decisions"]

    subgraph HID["High Impact Decisions"]
        H1["JWT Sessions"]
        H2["Socket.io"]
    end

    subgraph MID["Medium Impact Decisions"]
        M1["PostgreSQL"]
        M2["Dual Deploy"]
    end

    subgraph LID["Low Impact Decisions"]
        L1["Custom Auth"]
    end

    A --> HID
    A --> MID
    A --> LID

    H1 --- H2
    M1 --- M2

    classDef root fill:#ede9fe,stroke:#7c3aed,stroke-width:2px;
    classDef high fill:#dbeafe,stroke:#2563eb,stroke-width:2px;
    classDef medium fill:#fef3c7,stroke:#d97706,stroke-width:2px;
    classDef low fill:#dcfce7,stroke:#16a34a,stroke-width:2px;

    class A root;
    class H1,H2 high;
    class M1,M2 medium;
    class L1 low;
```

**Impact Analysis Explained:** This diagram categorizes decisions by their impact on the project. JWT sessions and Socket.io were high-impact decisions that fundamentally shaped the architecture. PostgreSQL and dual deployment were medium-impact decisions balancing trade-offs. Custom auth was a lower-impact decision focused on control.

---

## Known Limitations

### Current Limitations

```mermaid
flowchart TD
    subgraph Authentication
        A1[No multi-factor authentication]
        A2[No password-based login]
        A3[Sessions cannot be revoked]
    end
    
    subgraph Real-time
        R1[Socket service required]
        R2[No offline support]
        R3[Connection drops need refresh]
    end
    
    subgraph Task Management
        T1[No due date reminders]
        T2[No file attachments]
        T3[No task comments]
        T4[No subtask support]
    end
    
    subgraph Team Features
        F1[No team management]
        F2[No permission levels]
        F3[No bulk operations]
    end
```

**Limitations Explained:** The diagram categorizes all known limitations by feature area. Authentication lacks advanced security features. Real-time requires continuous connectivity. Task management misses some advanced features. Team collaboration is basic without permission systems.

### Impact Analysis and Solutions

| Limitation | User Impact | Potential Solution |
|------------|-------------|-------------------|
| No MFA | Reduced security for sensitive data | Implement TOTP or SMS verification |
| Socket Dependency | Real-time breaks without socket service | Add offline-first with sync queue |
| No Task Reminders | Tasks might be forgotten | Integrate push notification API |
| No File Attachments | Limited task context | Add S3-compatible storage |
| No Comments | No discussion capability | Add comments with user mentions |
| No Subtasks | Complex tasks hard to manage | Self-referential task relations |

---

## Future Roadmap

### Development Timeline

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

**Roadmap Explained:** The development timeline shows planned improvements. Q2 focuses on notifications and offline capabilities. Q3 adds rich content features. Q4 introduces team collaboration and analytics.

### Feature Priority Analysis

| Feature | Effort | Value | Priority |
|---------|--------|-------|----------|
| Push Notifications | Low | High | Do First |
| Offline Support | Medium | High | High |
| Task Comments | Low | Medium | Medium |
| File Attachments | Medium | Medium | Medium |
| Team Management | High | High | Plan Carefully |
| Analytics | Medium | Medium | Consider Later |

### Architecture Evolution

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

**Evolution Path Explained:** The architecture will evolve to handle increased scale. Micro-frontends enable independent feature development. Socket clusters provide real-time redundancy. Database read replicas improve query performance. Redis caching reduces database load.

---

## Developer Information

<div align="center">

### **Ansh Sharma**

**National Institute of Technology Calicut**

---

[![GitHub](https://img.shields.io/badge/GitHub-anshsharmacse-black?style=for-the-badge&logo=github)](https://github.com/anshsharmacse)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ansh_Sharma-blue?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/anshsharmacse/)

</div>

---

## License

This project is released under the MIT License.
---

<div align="center">

**Built with Next.js, Prisma, and Socket.io**

</div>
