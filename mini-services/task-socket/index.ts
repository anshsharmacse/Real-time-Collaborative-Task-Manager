import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Types
interface User {
  id: string
  email: string
  name: string
}

interface TaskUpdate {
  type: 'created' | 'updated' | 'deleted'
  task?: any
  taskId?: string
  timestamp: Date
}

// Store connected users with their socket ids
const connectedUsers = new Map<string, User>()
// Map email to socket ids for quick lookup
const emailToSocketIds = new Map<string, Set<string>>()

const PORT = 3003

io.on('connection', (socket: Socket) => {
  console.log(`[Task Socket] User connected: ${socket.id}`)

  // User authenticates with their info
  socket.on('authenticate', (data: { userId: string; email: string; name: string }) => {
    const { userId, email, name } = data
    
    // Store user info
    const user: User = { id: userId, email, name }
    connectedUsers.set(socket.id, user)
    
    // Map email to socket id
    if (!emailToSocketIds.has(email)) {
      emailToSocketIds.set(email, new Set())
    }
    emailToSocketIds.get(email)!.add(socket.id)
    
    // Join a room specific to this user
    socket.join(`user:${userId}`)
    socket.join(`email:${email}`)
    
    console.log(`[Task Socket] User authenticated: ${name} (${email})`)
    
    // Confirm authentication
    socket.emit('authenticated', { success: true })
  })

  // Handle task creation notification
  socket.on('task:created', (data: { task: any; assigneeEmail?: string }) => {
    const { task, assigneeEmail } = data
    const user = connectedUsers.get(socket.id)
    
    console.log(`[Task Socket] Task created: ${task.title} by ${user?.name || 'Unknown'}`)
    
    // Notify the assignee if they're connected
    if (assigneeEmail) {
      io.to(`email:${assigneeEmail}`).emit('task:assigned', {
        type: 'created',
        task,
        timestamp: new Date()
      })
    }
  })

  // Handle task update notification
  socket.on('task:updated', (data: { task: any; previousAssigneeEmail?: string }) => {
    const { task, previousAssigneeEmail } = data
    const user = connectedUsers.get(socket.id)
    
    console.log(`[Task Socket] Task updated: ${task.title} by ${user?.name || 'Unknown'}`)
    
    const update: TaskUpdate = {
      type: 'updated',
      task,
      timestamp: new Date()
    }
    
    // Notify all interested parties
    if (task.assignee?.email && task.assignee.email !== user?.email) {
      io.to(`email:${task.assignee.email}`).emit('task:updated', update)
    }
    if (task.creator?.email && task.creator.email !== user?.email) {
      io.to(`email:${task.creator.email}`).emit('task:updated', update)
    }
    // Notify previous assignee if changed
    if (previousAssigneeEmail && previousAssigneeEmail !== task.assignee?.email) {
      io.to(`email:${previousAssigneeEmail}`).emit('task:updated', update)
    }
  })

  // Handle task deletion notification
  socket.on('task:deleted', (data: { taskId: string; taskTitle: string; assigneeEmail?: string; creatorEmail: string }) => {
    const { taskId, taskTitle, assigneeEmail, creatorEmail } = data
    const user = connectedUsers.get(socket.id)
    
    console.log(`[Task Socket] Task deleted: ${taskTitle} by ${user?.name || 'Unknown'}`)
    
    const update: TaskUpdate = {
      type: 'deleted',
      taskId,
      timestamp: new Date()
    }
    
    // Notify assignee
    if (assigneeEmail && assigneeEmail !== user?.email) {
      io.to(`email:${assigneeEmail}`).emit('task:deleted', update)
    }
  })

  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id)
    
    if (user) {
      // Remove from email mapping
      const socketIds = emailToSocketIds.get(user.email)
      if (socketIds) {
        socketIds.delete(socket.id)
        if (socketIds.size === 0) {
          emailToSocketIds.delete(user.email)
        }
      }
      
      connectedUsers.delete(socket.id)
      console.log(`[Task Socket] User disconnected: ${user.name} (${user.email})`)
    } else {
      console.log(`[Task Socket] User disconnected: ${socket.id}`)
    }
  })

  socket.on('error', (error) => {
    console.error(`[Task Socket] Socket error (${socket.id}):`, error)
  })
})

httpServer.listen(PORT, () => {
  console.log(`[Task Socket] Real-time task service running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Task Socket] Received SIGTERM signal, shutting down...')
  httpServer.close(() => {
    console.log('[Task Socket] Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('[Task Socket] Received SIGINT signal, shutting down...')
  httpServer.close(() => {
    console.log('[Task Socket] Server closed')
    process.exit(0)
  })
})
