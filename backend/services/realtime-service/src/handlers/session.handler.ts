import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/socket.auth';

export class SessionHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  handleConnection(socket: AuthenticatedSocket) {
    // Handle session events
    socket.on('session:created', (data: any) => {
      // Notify all course members
      data.memberIds?.forEach((memberId: string) => {
        this.io.to(`user:${memberId}`).emit('session:created', {
          sessionId: data.sessionId,
          courseId: data.courseId,
          courseName: data.courseName,
          sessionName: data.sessionName,
          startTime: data.startTime,
        });
      });
    });

    socket.on('session:started', (data: any) => {
      // Notify all course members
      data.memberIds?.forEach((memberId: string) => {
        this.io.to(`user:${memberId}`).emit('session:started', {
          sessionId: data.sessionId,
          sessionName: data.sessionName,
          accessCode: data.accessCode,
        });
      });
      
      // Broadcast to course room
      this.io.to(`course:${data.courseId}`).emit('session:active', data);
    });

    socket.on('session:ended', (data: any) => {
      // Broadcast to course room
      this.io.to(`course:${data.courseId}`).emit('session:ended', data);
    });

    // Join session room for live updates
    socket.on('session:monitor', (sessionId: string) => {
      socket.join(`session:${sessionId}`);
      console.log(`User ${socket.userId} monitoring session ${sessionId}`);
    });
  }
}
