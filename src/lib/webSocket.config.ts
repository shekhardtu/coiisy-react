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

export const WS_CLIENT_MESSAGE_TYPES = {
  CLIENT_AUTH: 'client_auth' as const,
  CLIENT_USER_JOINED_SESSION: 'client_user_joined_session' as const,
  CLIENT_USER_DISCONNECTED: 'client_user_disconnected' as const,
  CLIENT_PING: 'client_ping' as const,
  CLIENT_CHAT: 'client_chat' as const,


}


export const WS_SERVER_MESSAGE_TYPES = {
  SERVER_USER_JOINED_SESSION: 'server_user_joined_session' as const,
  SERVER_AUTH_SUCCESS: 'server_auth_success' as const,
  SERVER_CHAT: 'server_chat' as const,
  SERVER_PONG: 'server_pong' as const,
  SERVER_USER_DISCONNECTED: 'server_user_disconnected' as const,
  SERVER_SESSION_MESSAGES: 'server_session_messages' as const,
}


export const WS_MESSAGE_TYPES = {
  ...WS_CLIENT_MESSAGE_TYPES,
  ...WS_SERVER_MESSAGE_TYPES,
} as const;
