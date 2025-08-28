import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/socket.auth';

export class CourseHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  handleConnection(socket: AuthenticatedSocket) {
    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining course room
    socket.on('course:join', (courseId: string) => {
      socket.join(`course:${courseId}`);
      console.log(`User ${socket.userId} joined course ${courseId}`);
    });

    // Handle leaving course room
    socket.on('course:leave', (courseId: string) => {
      socket.leave(`course:${courseId}`);
      console.log(`User ${socket.userId} left course ${courseId}`);
    });

    // Handle course updates from services
    socket.on('course:created', (data: any) => {
      // Notify course owner
      this.io.to(`user:${data.ownerId}`).emit('course:created', data);
    });

    socket.on('course:joined', (data: any) => {
      // Notify the user who joined
      this.io.to(`user:${data.userId}`).emit('course:joined', data);
      // Notify course members
      this.io.to(`course:${data.courseId}`).emit('member:joined', data);
    });

    socket.on('course:left', (data: any) => {
      // Notify course members
      this.io.to(`course:${data.courseId}`).emit('member:left', data);
    });
  }
}
