import mongoose from 'mongoose';

const isDev = process.env.NODE_ENV === 'development';

// Configuration constants with optimized defaults for low traffic
const MONGODB_URI = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DATABASE || 'afobata';
const MAX_POOL_SIZE = parseInt(process.env.MONGODB_MAX_POOL_SIZE || isDev ? '3' : '3', 10); // Reduced from 5 to 2
const MIN_POOL_SIZE = parseInt(process.env.MONGODB_MIN_POOL_SIZE || '0', 10); // Allow pool to shrink to 0
const CONNECTION_TIMEOUT = parseInt(process.env.MONGODB_CONNECTION_TIMEOUT || '10000', 10); // Reduced timeout
const SOCKET_TIMEOUT = parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '50000', 10); // Reduced timeout
const MAX_IDLE_TIME = parseInt(process.env.MONGODB_MAX_IDLE_TIME || '30000', 10); // 30 seconds idle time

// Connection state tracking
let cachedConnection: mongoose.Connection | null = null;
let connectionPromise: Promise<mongoose.Connection> | null = null;

// Add connection monitoring
let connectionCheckInterval: NodeJS.Timeout | null = null;

/**
 * Establishes and manages MongoDB connection with improved resource efficiency
 * @param ignoreCache Force a new connection even if one exists
 * @returns Mongoose connection object
 */
const connectDB = async (ignoreCache = false): Promise<mongoose.Connection> => {
  // Always use a fresh connection in development if requested
  if (isDev && ignoreCache) {
    await mongoose.connection.close().catch(() => {});
    cachedConnection = null;
  }

  // Return existing connection if valid
  if (cachedConnection?.readyState === 1 && !ignoreCache) {
    return cachedConnection;
  }

  // If connection is in progress, wait for it instead of creating a new one
  if (connectionPromise && !ignoreCache) {
    return connectionPromise;
  }

  // Create a new connection
  connectionPromise = (async () => {
    try {
      // Only connect if not already connected
      if (mongoose.connection.readyState !== 1) {
        console.info(
          '🔄 DB Connection: Establishing new connection...',
          !process.env.MONGODB_URL ? ' (Using default local MongoDB)' : ' (Using live MongoDB URL)',
        );

        await mongoose.connect(MONGODB_URI, {
          dbName: MONGODB_DB,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: SOCKET_TIMEOUT,
          maxPoolSize: MAX_POOL_SIZE,
          connectTimeoutMS: CONNECTION_TIMEOUT,
          retryWrites: true,
          wtimeoutMS: 2000,
          // Cost optimization - only create indexes in development
          autoIndex: isDev,
          // Connection pooling improvements
          minPoolSize: MIN_POOL_SIZE, // Allow pool to shrink to 0 for low traffic
          maxIdleTimeMS: MAX_IDLE_TIME, // Close idle connections after 30 seconds
        });

        console.info(
          '✅ DB Connection: Successfully established',
          !process.env.MONGODB_URL ? ' (Using default local MongoDB)' : ' (Using live MongoDB URL)',
        );
      }

      // Only set up listeners once
      if (!cachedConnection) {
        // Use once instead of on to prevent memory leaks
        mongoose.connection.once('error', (err) => {
          console.error('❌ Mongoose connection error:', err);
          cachedConnection = null;
          connectionPromise = null;
          stopConnectionMonitoring();
        });

        mongoose.connection.once('disconnected', () => {
          console.info('🚫 Mongoose disconnected');
          cachedConnection = null;
          connectionPromise = null;
          stopConnectionMonitoring();
        });

        // Add proper shutdown handling for production
        if (!isDev) {
          process.on('SIGINT', gracefulShutdown);
          process.on('SIGTERM', gracefulShutdown);
        }

        // Start connection monitoring for idle connections
        startConnectionMonitoring();
      }

      cachedConnection = mongoose.connection;
      return cachedConnection;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      cachedConnection = null;
      connectionPromise = null;
      throw error;
    }
  })();

  return connectionPromise;
};

/**
 * Start monitoring connections for idle time and excessive connections
 */
const startConnectionMonitoring = () => {
  if (connectionCheckInterval) return;

  // Check connections every minute
  connectionCheckInterval = setInterval(async () => {
    try {
      // Only run if we have an active connection
      if (mongoose.connection.readyState !== 1) return;

      // Get server status to check connection counts
      const db = mongoose.connection.db;
      if (!db) {
        console.error('❌ Database object is undefined. Skipping connection monitoring.');
        return;
      }
      const status = await db.admin().serverStatus();

      const currentConnections = status.connections.current;
      const maxConnections = status.connections.available + currentConnections;
      const connectionPercentage = (currentConnections / maxConnections) * 100;

      // console.info(
      //   `📊 MongoDB connections: ${currentConnections}/${maxConnections} (${connectionPercentage.toFixed(
      //     1
      //   )}%)`
      // );

      // If connections are above 70%, try to force garbage collection to release any unused connections
      if (connectionPercentage > 70) {
        console.info('⚠️ Connection usage high, forcing garbage collection');
        if (global.gc) {
          global.gc();
        }
      }
    } catch (error) {
      console.error('Error monitoring connections:', error);
    }
  }, 60000); // Check every minute
};

/**
 * Stop the connection monitoring interval
 */
const stopConnectionMonitoring = () => {
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
    connectionCheckInterval = null;
  }
};

/**
 * Gracefully close database connections before application shutdown
 */
const gracefulShutdown = async () => {
  console.info('🛑 Shutting down MongoDB connections gracefully...');
  stopConnectionMonitoring();
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.info('✅ MongoDB connections closed successfully');
  }
  process.exit(0);
};

export { connectDB };
