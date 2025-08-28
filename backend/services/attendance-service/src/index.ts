import app from './app';
import { connectRedis } from './config/redis';
import { constants } from './config/constants';

const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();
    console.log('Connected to Redis successfully');

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
