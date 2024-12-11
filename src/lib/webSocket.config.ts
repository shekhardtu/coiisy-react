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
  onlineTimeoutInMinutes: number;
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
  onlineTimeoutInMinutes: import.meta.env.VITE_WS_ONLINE_TIMEOUT_IN_MINUTES || 5,
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
  onlineTimeoutInMinutes: import.meta.env.VITE_WS_ONLINE_TIMEOUT_IN_MINUTES || 5,
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
  CLIENT_CHAT_EDIT: 'client_chat_edit' as const,
  CLIENT_CHAT_DELETE: 'client_chat_delete' as const,
  CLIENT_CHAT_REMOVE: 'client_chat_remove' as const,
  CLIENT_CHAT_REACT: 'client_chat_react' as const,
  CLIENT_CHAT_REACTION_REMOVE: 'client_chat_reaction_remove' as const,
  CLIENT_USER_APPROVE_TO_JOIN_SESSION: 'client_user_approve_to_join_session' as const,
  CLIENT_SESSION_ACCEPTED_TO_JOIN: 'client_session_accepted_to_join' as const,
  CLIENT_SESSION_REJECTED_TO_JOIN: 'client_session_rejected_to_join' as const,
  CLIENT_USER_REQUEST_TO_JOIN_SESSION: 'client_user_request_to_join_session' as const,
  CLIENT_USER_HANDLE_AUTO_JOIN: 'client_user_handle_auto_join' as const,
}


export const WS_SERVER_MESSAGE_TYPES = {
  SERVER_USER_JOINED_SESSION: 'server_user_joined_session' as const,
  SERVER_AUTH_SUCCESS: 'server_auth_success' as const,
  SERVER_CHAT: 'server_chat' as const,
  SERVER_PONG: 'server_pong' as const,
  SERVER_USER_DISCONNECTED: 'server_user_disconnected' as const,

  SERVER_CHAT_EDIT: 'server_chat_edit' as const,
  SERVER_CHAT_DELETE: 'server_chat_delete' as const,
  SERVER_CHAT_REACT: 'server_chat_react' as const,
  SERVER_CHAT_REACTION_REMOVE: 'server_chat_reaction_remove' as const,
  SERVER_CHAT_REMOVE: 'server_chat_remove' as const,
  SERVER_USER_REQUEST_TO_JOIN_SESSION: 'server_user_request_to_join_session' as const,
  SERVER_USER_REQUEST_TO_JOIN_SESSION_TO_ADMIN: 'server_session_user_request_to_join_session_to_admin' as const,
  SERVER_USER_REQUEST_TO_JOIN_SESSION_TO_GUEST: 'server_session_user_request_to_join_session_to_guest' as const,
  SERVER_SESSION_MESSAGES: 'server_session_messages' as const,
}

// Add these new type utilities
export type ClientMessageTypes = typeof WS_CLIENT_MESSAGE_TYPES[keyof typeof WS_CLIENT_MESSAGE_TYPES];
export type ServerMessageTypes = typeof WS_SERVER_MESSAGE_TYPES[keyof typeof WS_SERVER_MESSAGE_TYPES];

export const WS_MESSAGE_TYPES = {
  ...WS_CLIENT_MESSAGE_TYPES,
  ...WS_SERVER_MESSAGE_TYPES,
} as const;

// Make sure to update the type definition to include the new message type
export type WebSocketMessageTypes = typeof WS_MESSAGE_TYPES[keyof typeof WS_MESSAGE_TYPES];
