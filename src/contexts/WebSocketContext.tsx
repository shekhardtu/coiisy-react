import { wsConfig } from '@/lib/webSocket.config';
import { CurrentUserInterface, OnlineUserInterface, SessionDataInterface } from '@/pages/public/coEditor/components/Editor.types';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';


import { getCurrentTimeStamp, local } from '@/lib/utils';
import { getWebSocketURL } from '@/lib/webSocket.config';


// Base message type that all messages must extend
interface BaseMessage {
  type: string;
  createdAt: string | Date;
}

// Specific message types
interface ChatMessage extends BaseMessage {
  type: 'chat';
  sessionId: string;
  userId: string;
  fullName: string;
  content: string;
}

interface PingMessage extends BaseMessage {
  type: 'ping';
}

interface PongMessage extends BaseMessage {
  type: 'pong';
}

interface JoinSessionMessage extends BaseMessage {
  type: 'user_joined_session';
  sessionId: string;
}

interface SystemMessage extends BaseMessage {
  type: 'system';
  message: string;
  level?: 'info' | 'warning' | 'error';
}

export interface AuthMessageInterface extends BaseMessage {
  type: 'auth';
  userId: string;
}

export interface UserJoinedSessionMessage extends BaseMessage {
  type: 'user_joined_session';
  participants: OnlineUserInterface[];
}

export interface UserJoinedMessage extends BaseMessage {
  userId?: string;
  fullName?: string;
  type: 'user_joined_session';
  user: CurrentUserInterface;
}

export interface UserDisconnectedMessage extends BaseMessage {
  userId?: string;
  type: 'user_disconnected';
}

// Union type of all possible message types
type WebSocketMessage = ChatMessage | PingMessage | PongMessage | SystemMessage | JoinSessionMessage | AuthMessageInterface | UserJoinedMessage | UserDisconnectedMessage | UserJoinedSessionMessage;

// Type guard to check message types
const isValidMessageType = (data: unknown): data is WebSocketMessage => {

  if (typeof data !== 'object' || data === null) return false;
  return 'type' in data && ('createdAt' in data || 'timestamp' in data);
};

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'reconnecting';

interface WebSocketState {
  reconnectCount: number;
}

// Generic type for message handlers
type MessageHandler<T extends WebSocketMessage> = (message: T) => void;

interface WebSocketContextType {
  status: ConnectionStatus;
  sendMessage: (message: WebSocketMessage) => void;
  tryConnect: () => void;
  disconnect: () => void;
  subscribe: <T extends WebSocketMessage>(
    type: T['type'],
    callback: MessageHandler<T>
  ) => () => void;
  user_joined_session: (sessionData: SessionDataInterface) => void;
  sessionId: string | null;
  setSessionId: (sessionId: string | null) => void;
  currentUser: CurrentUserInterface | null;
  setCurrentUser: (currentUser: CurrentUserInterface | null) => void;
  sendAuthMessage: (message: AuthMessageInterface) => void;
  serverAvailable: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
  url?: string; // Make URL optional since we have environment defaults
}



export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  url = getWebSocketURL() // Use environment-based URL as default
}) => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listenersRef = useRef<Map<string, Set<MessageHandler<WebSocketMessage>>>>(new Map());
  const stateRef = useRef<WebSocketState>({ reconnectCount: 0 });
  const isConnectingRef = useRef<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUserInterface | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [serverAvailable, setServerAvailable] = useState(true);




  useEffect(() => {
    if (sessionId) {
      const { guestIdentifier } = local("json", "key").get(`sessionIdentifier-${sessionId}`) || {};
      setCurrentUser(guestIdentifier);

    }
  }, [sessionId]);

  const clearAllTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    clearPingInterval();
  }, []);

  const calculateBackoffDelay = () => {
    const maxRetries = 5;
    const baseDelay = wsConfig.reconnectDelay;
    const retryCount = stateRef.current.reconnectCount;

    if (retryCount >= maxRetries) {
      return baseDelay * Math.pow(2, maxRetries);
    }

    stateRef.current.reconnectCount += 1;
    return baseDelay * Math.pow(2, retryCount);
  };



  const resetReconnectCount = () => {
    stateRef.current.reconnectCount = 0;
  };

  const clearPingInterval = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  };

  const sendAuthMessage = useCallback((message: AuthMessageInterface) => {

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  const setupPingInterval = useCallback((ws: WebSocket) => {

    pingIntervalRef.current = setInterval(() => {

      if (ws.readyState === WebSocket.OPEN) {

        ws.send(JSON.stringify({
          userId: currentUser?.userId,
          type: 'ping',
          createdAt: new Date().toISOString()
        }));
      }
    }, wsConfig.pingInterval);
  }, [currentUser]);

  const handleIncomingMessage = (event: MessageEvent) => {
    try {

      const data = JSON.parse(event.data);
      console.log(data['type']);
      if (!isValidMessageType(data)) {
        console.error('Invalid message format:', data);

        return;
      }

      const listeners = listenersRef.current.get(data.type);
      if (listeners) {
        listeners.forEach(listener => listener(data));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error handling WebSocket message:', error.message);
      }
    }
  };

  const subscribe = <T extends WebSocketMessage>(
    type: T['type'],
    callback: MessageHandler<T>
  ) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, new Set());
    }
    // Type assertion needed here as we know the callback is compatible
    listenersRef.current.get(type)?.add(callback as MessageHandler<WebSocketMessage>);

    return () => {
      listenersRef.current.get(type)?.delete(callback as MessageHandler<WebSocketMessage>);
    };
  };

  const tryConnect = useCallback(() => {
    if (isConnectingRef.current || status === 'connected') {
      log('Connection already in progress or connected');
      return;
    }

    isConnectingRef.current = true;
    setServerAvailable(true);  // Reset server status at each attempt
    setStatus('connecting');

    const connectionTimeout = setTimeout(() => {

      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        log('Connection timeout - server might be down');
        setServerAvailable(false);
        setStatus('disconnected');
        isConnectingRef.current = false;
        wsRef.current?.close();
        wsRef.current = null;
      }
    }, wsConfig.connectionTimeout || 5000);

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    clearAllTimeouts();

    try {
      const ws = new WebSocket(url);
      log('Initiating connection to:', url);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        log('Connected successfully');
        setStatus('connected');
        setServerAvailable(true);
        isConnectingRef.current = false;
        setupPingInterval(ws);
        if (currentUser) {
          sendAuthMessage({
            type: 'auth',
            userId: currentUser.userId || '',
            createdAt: getCurrentTimeStamp(),
          });
        }
        resetReconnectCount();
        wsRef.current = ws;
      };

      ws.onmessage = handleIncomingMessage;

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        log('Connection closed:', event.code, event.reason);
        setStatus('disconnected');
        clearAllTimeouts();
        isConnectingRef.current = false;
        wsRef.current = null;

        if (event.code === 1006) {
          setServerAvailable(false);
        }

        if (wsConfig.enableStartupAutoConnect &&
            stateRef.current.reconnectCount < wsConfig.maxReconnectAttempts &&
            serverAvailable) {
          const delay = calculateBackoffDelay();
          reconnectTimeoutRef.current = setTimeout(tryConnect, delay);
        }
      };

      ws.onerror = (error) => {
        log('Error occurred:', error instanceof Error ? error.message : 'WebSocket error');
        setServerAvailable(false);
      };

      wsRef.current = ws;
    } catch (error) {
      clearTimeout(connectionTimeout);
      log('Failed to create connection:', error instanceof Error ? error.message : 'Unknown error');
      setServerAvailable(false);
      setStatus('disconnected');
      isConnectingRef.current = false;
    }
  }, [status, clearAllTimeouts, url, setupPingInterval, currentUser, sendAuthMessage, serverAvailable]);

  const disconnect = useCallback(() => {
    log('Disconnecting...');
    setStatus('disconnected');
    clearAllTimeouts();
    stateRef.current.reconnectCount = 0;
    isConnectingRef.current = false;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [clearAllTimeouts]);

  // Single effect for initial connection
  useEffect(() => {
    if (
      wsConfig.enableStartupAutoConnect &&
      status === 'disconnected' &&
      !isConnectingRef.current
    ) {
      tryConnect();
    }
    return () => {
      disconnect();
    };
  }, []);  // Empty dependency array for initial connection only




  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  const user_joined_session = useCallback((sessionData: SessionDataInterface) => {
    if (status === 'connected') {
      sendMessage({
        ...sessionData,
        sessionId: sessionData.sessionId || '',
        type: 'user_joined_session',
        createdAt: getCurrentTimeStamp(),
      });
    }
  }, [sendMessage, status]);

  const contextValue = useMemo<WebSocketContextType>(() => ({
    sendAuthMessage,
    status,
    sendMessage,
    tryConnect,
    disconnect,
    subscribe,
    user_joined_session,
    currentUser,
    setCurrentUser,
    sessionId,
    setSessionId,
    serverAvailable
  }), [
    status,
    sendAuthMessage,
    sendMessage,
    tryConnect,
    disconnect,
    user_joined_session,
    currentUser,
    setCurrentUser,
    sessionId,
    setSessionId,
    serverAvailable
  ]);

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Type-safe logging
const log = (message: string, ...args: Array<string | number | Error>) => {
  if (!import.meta.env.PROD) {
    console.log(`[WebSocket] ${message}`, ...args);
  }
};

// Type-safe hook
export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};