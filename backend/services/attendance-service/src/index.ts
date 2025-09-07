import dotenv from 'dotenv';
import path from 'path';
import app from './app';
import { connectRedis } from './config/redis';
import { constants } from './config/constants';
import realtimeClient from './config/realtime-client';

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();
    console.log('Connected to Redis successfully');

    // Initialize realtime client after environment is loaded
    realtimeClient.init();

    // Start the server
    const port = constants.PORT;
    app.listen(port, () => {
      console.log(`Attendance service running on port ${port}`);
      console.log(`Environment: ${constants.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
