# TaskFlow - Real-time Collaborative Task Manager

A modern, real-time collaborative task manager built with Next.js 16, featuring Google Authentication, task assignment by email, and live updates via WebSockets.

![TaskFlow](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)

## ✨ Features

- **🔐 Google Authentication** - Secure login with Google OAuth
- **📧 Demo Login** - Try the app instantly without Google account
- **📋 Task Management** - Full CRUD operations with priorities and due dates
- **👥 Task Assignment** - Assign tasks to anyone by email address
- **⚡ Real-time Updates** - See task changes instantly via WebSockets
- **🌙 Dark Mode** - Full dark mode support
- **📱 Responsive Design** - Works beautifully on all devices
- **🎨 Premium UI** - Modern design with smooth animations

## 🛠 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM (SQLite dev / PostgreSQL production)
- **Authentication**: NextAuth.js v4
- **Real-time**: Socket.io
- **State Management**: Zustand
- **Animations**: Framer Motion

## 📋 Prerequisites

Before deploying, you'll need:

1. **Supabase Account** (free tier) - For PostgreSQL database
2. **Google Cloud Console** - For OAuth credentials
3. **Vercel Account** - For deployment
4. **GitHub Account** - For code hosting

## 🚀 Deployment Guide

### Step 1: Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Project Settings** → **Database**
4. Copy the **Connection string** (URI format)
5. Replace `[YOUR-PASSWORD]` with your database password

Your connection string should look like:
```
postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

### Step 2: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://your-app-name.vercel.app` (production)
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-app-name.vercel.app/api/auth/callback/google`
8. Copy the **Client ID** and **Client Secret**

### Step 3: Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - TaskFlow app"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/log in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Vercel URL (e.g., `https://your-app.vercel.app`) |

5. Click **Deploy**
6. Wait for deployment to complete

### Step 5: Update Google OAuth

After deployment:

1. Go back to Google Cloud Console
2. Add your production URL to authorized origins
3. Add your production callback URL:
   - `https://your-app.vercel.app/api/auth/callback/google`

### Step 6: Add Test Users (Google OAuth)

If your app is in testing mode:

1. Go to **OAuth consent screen** in Google Cloud Console
2. Add test users by email address
3. Only these users can sign in during testing

## 🏃 Local Development

```bash
# Install dependencies
bun install

# Set up environment variables (create .env file)
DATABASE_URL="file:./dev.db"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Push database schema
bun run db:push

# Start development server
bun run dev

# Start socket service (in another terminal)
cd mini-services/task-socket && bun run dev
```

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma          # SQLite schema (development)
│   └── schema.production.prisma # PostgreSQL schema (production)
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page
│   ├── components/
│   │   ├── tasks/             # Task components
│   │   ├── ui/                # shadcn/ui components
│   │   └── providers/         # Context providers
│   ├── hooks/                 # Custom hooks
│   └── lib/                   # Utilities and store
├── mini-services/
│   └── task-socket/           # Socket.io service
└── public/                    # Static assets
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | ✅ |
| `NEXTAUTH_URL` | App URL for callbacks | ✅ |
| `NEXTAUTH_SECRET` | Secret for JWT encryption | ✅ |

---

## 👨‍💻 Developer

**Ansh Sharma**  
National Institute of Technology Calicut

---

## 📝 License

MIT License - Feel free to use this project for learning or production.

---

Built with ❤️ using Next.js, Prisma, and Socket.io
