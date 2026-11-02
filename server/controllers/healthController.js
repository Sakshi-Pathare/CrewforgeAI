import { getDbStatus, triggerReconnect } from '../config/db.js';

export const checkHealth = async (req, res) => {
  // If ?retry=true is specified and not currently connected, trigger reconnect
  if (req.query.retry === 'true') {
    const current = getDbStatus();
    if (!current.isConnected) {
      await triggerReconnect();
    }
  }

  const dbStatus = getDbStatus();

  res.status(200).json({
    status: 'ok',
    service: 'Crew Forge API - AI-Powered Crew Assembly Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
  });
};

export const reconnectDatabase = async (req, res) => {
  try {
    const result = await triggerReconnect();
    res.status(200).json({
      success: result.isConnected,
      isConnected: result.isConnected,
      message: result.isConnected
        ? 'Successfully connected to MongoDB Atlas cluster.'
        : 'Failed to connect to MongoDB Atlas. Please verify that your current IP address is authorized in Atlas Network Access.',
      database: result.database,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      isConnected: false,
      message: error.message || 'Database reconnection failed.',
    });
  }
};
