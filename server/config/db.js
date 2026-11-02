import mongoose from 'mongoose';
import dns from 'dns';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 1. Ensure server/.env is loaded reliably
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverEnvPath = path.resolve(__dirname, '../.env');
const rootEnvPath = path.resolve(__dirname, '../../.env');

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

/**
 * Mask credentials in a MongoDB URI so passwords are never logged or exposed.
 */
export const maskMongoURI = (uri) => {
  if (!uri) return 'Not configured (empty)';
  try {
    const parsed = new URL(uri);
    const hasAuth = !!(parsed.username || parsed.password);
    const authDisplay = hasAuth ? '***:***@' : '';
    return `${parsed.protocol}//${authDisplay}${parsed.host}${parsed.pathname || ''}`;
  } catch {
    return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  }
};

let isReconnecting = false;
let activeConnectPromise = null;
let retryInterval = null;
let listenersAttached = false;
let retryCount = 0;
const MAX_AUTO_RETRIES = 5;

let lastConnectionError = null;
let lastErrorCategory = null;

/**
 * Attach lifecycle event listeners to mongoose.connection
 */
const setupConnectionListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('connected', () => {
    console.log(`\n✅ [MongoDB Event] Connection established successfully!`);
    console.log(`   Host:     ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   State:    Ready (Connected)\n`);
    
    lastConnectionError = null;
    lastErrorCategory = null;
    retryCount = 0;

    // Stop background retry loop if running
    if (retryInterval) {
      clearInterval(retryInterval);
      retryInterval = null;
    }
  });

  mongoose.connection.on('error', (err) => {
    lastConnectionError = maskMongoURI(err.message);
    console.error(`❌ [MongoDB Event Error]: ${lastConnectionError}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn(`⚠️  [MongoDB Event] Connection lost / disconnected.`);
    // Start background reconnection attempts with rate limit
    scheduleBackgroundReconnect();
  });

  mongoose.connection.on('reconnected', () => {
    console.log(`🔄 [MongoDB Event] Reconnected to MongoDB Atlas cluster.`);
    lastConnectionError = null;
    lastErrorCategory = null;
    retryCount = 0;
  });
};

/**
 * Schedule background reconnection attempts every 30 seconds when disconnected,
 * up to MAX_AUTO_RETRIES to prevent endless loops or socket exhaustion.
 */
const scheduleBackgroundReconnect = () => {
  if (retryInterval) return;
  if (retryCount >= MAX_AUTO_RETRIES) {
    console.log(`ℹ️  [MongoDB Auto-Reconnect] Pausing background retries after ${MAX_AUTO_RETRIES} attempts.`);
    console.log(`   Use the dashboard "Reconnect" button or POST /api/health/reconnect to retry.`);
    return;
  }

  retryInterval = setInterval(async () => {
    if (mongoose.connection.readyState === 1) {
      clearInterval(retryInterval);
      retryInterval = null;
      retryCount = 0;
      return;
    }

    retryCount++;
    console.log(`🔄 [MongoDB Auto-Reconnect] Attempt ${retryCount}/${MAX_AUTO_RETRIES} connecting to MongoDB Atlas...`);
    try {
      await connectDB({ isBackgroundRetry: true });
    } catch {
      // Handled inside connectDB
    }

    if (retryCount >= MAX_AUTO_RETRIES && mongoose.connection.readyState !== 1) {
      clearInterval(retryInterval);
      retryInterval = null;
      console.log(`ℹ️  [MongoDB Auto-Reconnect] Reached ${MAX_AUTO_RETRIES} attempts without connection. Pausing auto-retries.`);
    }
  }, 30000);

  if (retryInterval && typeof retryInterval.unref === 'function') {
    retryInterval.unref();
  }
};

/**
 * Connect to MongoDB with timeout protection and clear diagnostics.
 * Concurrency guard ensures multiple concurrent calls await the single active attempt.
 */
export const connectDB = async (options = {}) => {
  setupConnectionListeners();

  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Prevent overlapping concurrent attempts - reuse in-flight promise
  if (activeConnectPromise) {
    return activeConnectPromise;
  }

  activeConnectPromise = (async () => {
    isReconnecting = true;
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crewforge';
    const isAtlas = mongoURI.startsWith('mongodb+srv://');
    const safeURI = maskMongoURI(mongoURI);

    if (!options.isBackgroundRetry) {
      console.log('\n======================================================');
      console.log('📡 CREW FORGE DATABASE CONNECTION');
      console.log('======================================================');
      console.log(`[Diagnostic] Protocol:        ${isAtlas ? 'mongodb+srv://' : 'mongodb://'}`);
      console.log(`[Diagnostic] Atlas Cloud DB:  ${isAtlas ? 'YES (MongoDB Atlas)' : 'NO (Standard/Local)'}`);
      console.log(`[Diagnostic] Target Cluster:  ${safeURI}`);
      console.log(`[Diagnostic] Credentials:     [PROTECTED - Hidden from logs]`);
      console.log('======================================================\n');
    }

    // Configure public DNS resolvers for mongodb+srv:// on Windows
    if (isAtlas) {
      try {
        dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
      } catch {
        // Fall back to system DNS if setServers fails
      }
    }

    try {
      // If half-open or disconnected, clean close before re-attempting
      if (mongoose.connection.readyState !== 0 && options.force) {
        await mongoose.disconnect().catch(() => {});
      }

      const timeoutMs = options.timeoutMS || (process.env.NODE_ENV === 'test' ? 2000 : 8000);

      const connectPromise = mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: timeoutMs,
        connectTimeoutMS: timeoutMs,
        family: 4,
      });

      let timer;
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Connection attempt timed out after ${timeoutMs}ms`)), timeoutMs);
      });

      const conn = await Promise.race([connectPromise, timeoutPromise]).finally(() => {
        clearTimeout(timer);
      });

      lastConnectionError = null;
      lastErrorCategory = null;
      retryCount = 0;
      isReconnecting = false;
      return conn;
    } catch (error) {
      isReconnecting = false;
      const sanitizedErr = maskMongoURI(error.message);
      lastConnectionError = sanitizedErr;

      const isWhitelistIssue = 
        error.message.includes('whitelist') || 
        error.message.includes('SSL') || 
        error.message.includes('alert') ||
        error.message.includes('MongooseServerSelectionError');

      lastErrorCategory = isWhitelistIssue
        ? 'IP_WHITELIST_OR_FIREWALL'
        : (error.message.includes('timed out') ? 'TIMEOUT' : 'CONNECTION_FAILED');

      console.warn(`⚠️  [Database Warning] Could not connect to ${safeURI}`);
      console.warn(`   Reason: ${sanitizedErr}`);

      if (isWhitelistIssue) {
        console.warn(`\n📌 [MongoDB Atlas IP Access Notice]`);
        console.warn(`   MongoDB Atlas closed the connection handshake (SSL alert 80 / ServerSelectionError).`);
        console.warn(`   This typically occurs when your current public IP is not in Atlas Network Access.`);
        console.warn(`   To enable connection:`);
        console.warn(`   1. Open cloud.mongodb.com -> Select your project -> Network Access`);
        console.warn(`   2. Click "+ Add IP Address"`);
        console.warn(`   3. Click "Allow Access From Anywhere" (0.0.0.0/0) or add your current IP.`);
        console.warn(`   4. Click "Confirm" and wait ~1 minute for Atlas to apply the rule.`);
        console.warn(`   5. Click "Reconnect" on the Crew Forge dashboard.\n`);
      }

      scheduleBackgroundReconnect();
      return null;
    }
  })().finally(() => {
    activeConnectPromise = null;
    isReconnecting = false;
  });

  return activeConnectPromise;
};

/**
 * Manually trigger an on-demand reconnection attempt (used by /api/health/reconnect)
 */
export const triggerReconnect = async () => {
  console.log('🔄 [Database] Manual reconnection requested...');
  retryCount = 0; // Reset retry counter on user action
  const conn = await connectDB({ force: true });
  const status = getDbStatus();
  return {
    success: status.isConnected,
    isConnected: status.isConnected,
    status: status.status,
    host: status.host,
    name: status.name,
    targetCluster: status.targetCluster,
    errorCategory: status.errorCategory,
    database: status,
  };
};

/**
 * Get accurate real-time database connection status
 */
export const getDbStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crewforge';
  const isAtlas = mongoURI.startsWith('mongodb+srv://');

  let targetHost = null;
  let dbName = null;
  try {
    const u = new URL(mongoURI);
    targetHost = u.host;
    dbName = u.pathname ? u.pathname.replace(/^\//, '') : null;
  } catch {
    targetHost = 'cluster0.5bg9uxe.mongodb.net';
    dbName = 'crewforge';
  }

  const isConnected = mongoose.connection.readyState === 1;

  return {
    isConnected,
    status: states[mongoose.connection.readyState] || 'unknown',
    host: isConnected ? (mongoose.connection.host || targetHost) : null,
    name: isConnected ? (mongoose.connection.name || dbName) : dbName,
    targetCluster: targetHost,
    isAtlas,
    sanitizedURI: maskMongoURI(mongoURI),
    errorCategory: isConnected ? null : lastErrorCategory,
    lastError: isConnected ? null : lastConnectionError,
  };
};
