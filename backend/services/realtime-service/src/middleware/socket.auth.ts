import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
  role?: string;
}

export const authenticateSocket = async (socket: AuthenticatedSocket, next: any) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    socket.userId = decoded.userId;
    socket.email = decoded.email;
    socket.role = decoded.role;
    
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
};
