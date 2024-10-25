interface WebSocketConfig {
  url: string;
  pingInterval: number;
  reconnectDelay: number;
  maxReconnectAttempts: number;
  enableStartupAutoConnect: boolean;
  autoConnectAfterDisconnect: boolean;
  isSecure: boolean;
  connectionTimeout: number;
  healthCheckInterval: number;
}

const parseEnvBoolean = (value: string | undefined): boolean => {
  return value?.toLowerCase() === 'true'
}


const developmentConfig: WebSocketConfig = {
  url: import.meta.env.VITE_WEBSOCKET_URL,
  pingInterval:  import.meta.env.VITE_WS_PING_INTERVAL || 30000,
  reconnectDelay:  import.meta.env.VITE_WS_RECONNECT_DELAY || 5000,
  maxReconnectAttempts: import.meta.env.VITE_WS_MAX_RECONNECT_ATTEMPTS || 3,
  enableStartupAutoConnect: parseEnvBoolean(import.meta.env.VITE_WS_ENABLE_STARTUP_AUTO_CONNECT) || false,
  autoConnectAfterDisconnect: parseEnvBoolean(import.meta.env.VITE_WS_AUTO_CONNECT_AFTER_DISCONNECT) || false,
  isSecure: false,
  connectionTimeout: import.meta.env.VITE_WS_CONNECTION_TIMEOUT || 5000,
  healthCheckInterval: import.meta.env.VITE_WS_HEALTH_CHECK_INTERVAL || 3000,
};

const productionConfig: WebSocketConfig = {
  url: import.meta.env.VITE_WEBSOCKET_URL,
  pingInterval:  import.meta.env.VITE_WS_PING_INTERVAL || 60000,
  reconnectDelay:  import.meta.env.VITE_WS_RECONNECT_DELAY || 10000,
  maxReconnectAttempts: import.meta.env.VITE_WS_MAX_RECONNECT_ATTEMPTS || 5,
  enableStartupAutoConnect: parseEnvBoolean(import.meta.env.VITE_WS_ENABLE_STARTUP_AUTO_CONNECT) || false,
  autoConnectAfterDisconnect: parseEnvBoolean(import.meta.env.VITE_WS_AUTO_CONNECT_AFTER_DISCONNECT) || false,
  isSecure: true,
  connectionTimeout: import.meta.env.VITE_WS_CONNECTION_TIMEOUT || 5000,
  healthCheckInterval: import.meta.env.VITE_WS_HEALTH_CHECK_INTERVAL || 3000,
};

export const wsConfig: WebSocketConfig =
  import.meta.env.PROD ? productionConfig : developmentConfig;

// Utility functions
export const getWebSocketURL = () => {
  const url = wsConfig.url;
  const isSecure = import.meta.env.PROD || window.location.protocol === 'https:';

  if (isSecure && url.startsWith('ws://')) {
    return url.replace('ws://', 'wss://');
  }

  return url;
};

