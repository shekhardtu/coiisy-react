import { WS_MESSAGE_TYPES, wsConfig } from '@/lib/webSocket.config';
import {
  AuthMessageInterface,
  ClientMessage,
  ClientUserJoinedSessionInterface,
  CurrentUserInterface,
  ServerMessage
} from '@/pages/public/coEditor/components/Editor.types';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';


import { getCurrentTimeStamp, local } from '@/lib/utils';
import { getWebSocketURL } from '@/lib/webSocket.config';


//
// Union type of all possible message types
type WebSocketMessage = ClientMessage | ServerMessage;
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
  userJoinedSession: (message: ClientUserJoinedSessionInterface) => void;
  sessionId: string;
  setSessionId: (sessionId: string) => void;
  currentUser: CurrentUserInterface;
  setCurrentUser: (currentUser: CurrentUserInterface) => void;
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
  const [currentUser, setCurrentUser] = useState<CurrentUserInterface>({} as CurrentUserInterface);
  const [sessionId, setSessionId] = useState<string>("");
  const [serverAvailable, setServerAvailable] = useState(true);




  const getCurrentUser = useCallback((sessionId: string) => {
    const sessionData = local("json", sessionId).get(`sessionIdentifier`);
    return sessionData?.guestIdentifier;
  }, []);

  useEffect(() => {

    if (sessionId) {
      const currentUser = getCurrentUser(sessionId);
      if (currentUser) {
        setCurrentUser(currentUser);
        // If we have both sessionId and currentUser, try connecting
        if (!wsRef.current && status === 'disconnected') {
          tryConnect();
        }
      }
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

  const setupPingInterval = useCallback((ws: WebSocket, currentUser: CurrentUserInterface, sessionId: string) => {
    clearPingInterval(); // Clear any existing interval firs  t

    if (!currentUser || !sessionId) {
      console.warn('Missing user or session data for ping setup');
      return;
    }

    pingIntervalRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const pingMessage = {
          userId: currentUser.userId,
          sessionId: sessionId || currentUser.sessionId,
          type: WS_MESSAGE_TYPES.CLIENT_PING,
          createdAt: getCurrentTimeStamp()
        };
        ws.send(JSON.stringify(pingMessage));
      } else {
        disconnect();
      }
    }, wsConfig.pingInterval);
  }, []);

  const handleIncomingMessage = (event: MessageEvent) => {
    try {

      const data = JSON.parse(event.data);
      // console.log(data);
      if (!isValidMessageType(data)) {
        console.error('Invalid message format:', data);

        return;
      }

      console.log(data.type);

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

    if (!sessionId) {
      console.warn('No session ID found');
      return;
    }

    const currentUser = getCurrentUser(sessionId);
    setCurrentUser(currentUser);

    if (!currentUser) {
      console.warn('No current user found');
      return;
    }


    isConnectingRef.current = true;
    setServerAvailable(true);
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
        wsRef.current = ws;

        // Only setup ping and send auth if we have necessary data

        if (currentUser?.userId && sessionId) {
          setupPingInterval(ws, currentUser, sessionId);
          sendAuthMessage({
            type: WS_MESSAGE_TYPES.CLIENT_AUTH,
            sessionId,
            userId: currentUser.userId,
            createdAt: getCurrentTimeStamp(),
          });
        } else {
          console.warn('Missing user or session data on connection');
        }
        resetReconnectCount();
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
  }, [status, clearAllTimeouts, url, setupPingInterval, sessionId, sendAuthMessage, serverAvailable]);

  const disconnect = useCallback(() => {
    log('Disconnecting...');
    setStatus('disconnected');
    clearAllTimeouts();
    stateRef.current.reconnectCount = 0;
    isConnectingRef.current = false;

    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          const disconnectMessage = {
            type: WS_MESSAGE_TYPES.CLIENT_USER_DISCONNECTED,
            sessionId: sessionId,
            userId: currentUser?.userId,
          };
          wsRef.current.send(JSON.stringify(disconnectMessage));
        }

        // wsRef.current.close();
        // wsRef.current = null;
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
    }
  }, [clearAllTimeouts, currentUser, sessionId]);

  // Single effect for initial connection
  useEffect(() => {
    if (
      wsConfig.enableStartupAutoConnect &&
      status === 'disconnected' &&
      !isConnectingRef.current &&
      sessionId // Only connect if we have a sessionId
    ) {
      tryConnect();
    }

    // Cleanup function
    return () => {
      if (wsRef.current) {
        disconnect();
      }
    };
  }, [sessionId]); // Add sessionId as dependency




  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  const userJoinedSession = useCallback((message: ClientUserJoinedSessionInterface) => {
    if (status === 'connected' && message.userId) {
      sendMessage({
        ...message,
        sessionId: message.sessionId,
        type: 'client_user_joined_session',
        userId: message.userId,
        createdAt: getCurrentTimeStamp(),
        fullName: message.fullName,
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
    userJoinedSession,
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
    userJoinedSession,
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
  if (!import.meta.env.PROD && import.meta.env.VITE_DEV_LOG_ENABLED === 'true') {
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