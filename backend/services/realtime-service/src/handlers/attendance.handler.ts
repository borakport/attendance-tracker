import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/socket.auth';

export class AttendanceHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  handleConnection(socket: AuthenticatedSocket) {
    // Handle attendance events from attendance service
    socket.on('attendance:marked', (data: any) => {
      console.log(`📍 Attendance marked event received:`, data);
      
      // Broadcast to session room (instructor monitoring)
      this.io.to(`session:${data.sessionId}`).emit('attendance:marked', data);
      
      // Notify the specific user who marked attendance
      this.io.to(`user:${data.userId}`).emit('attendance:confirmed', {
        status: data.status,
        distance: data.distance,
        markedAt: data.markedAt
      });
      
      console.log(`✅ Broadcasted attendance to session:${data.sessionId}`);
    });

    socket.on('attendance:updated', (data: any) => {
      // Broadcast to session room
      this.io.to(`session:${data.sessionId}`).emit('attendance:updated', data);
    });
  }
}
