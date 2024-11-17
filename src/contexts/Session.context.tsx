import type { ServerMessage } from '@/pages/public/coEditor/components/Editor.types';
import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { WS_MESSAGE_TYPES } from "../lib/webSocket.config";
import { useWebSocket } from "./WebSocketContext";

interface SessionContextType {

  handleUserRequestToJoin: (message: ServerMessage) => void;
}

interface SessionProviderProps {
  children: React.ReactNode;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {

  const { subscribe, status, currentUser } = useWebSocket();




  const handleUserRequestToJoin = useCallback((message: ServerMessage) => {
    if (message.type === WS_MESSAGE_TYPES.SERVER_USER_REQUEST_TO_JOIN_SESSION) {
      console.log("Handling user request to join session:", message.sessionId);
      // Add your logic here to handle the join request
    }
  }, []);

  useEffect(() => {
    // Only set up subscription when we have all required data
    // if (!status || !sessionId || !currentUser?.userId) {
    //   console.log("Missing required data for subscription, skipping setup");
    //   return;
    // }

    console.log("Setting up subscription for user request to join session");
    const unsubscribe = subscribe(
      WS_MESSAGE_TYPES.SERVER_USER_REQUEST_TO_JOIN_SESSION,
      handleUserRequestToJoin
    );

    return () => {
      console.log("Cleaning up subscription");
      unsubscribe();
    };
  }, [

    status,
    currentUser?.userId,
    subscribe,
    handleUserRequestToJoin
  ]);

  const contextValue = useMemo(() => ({
    handleUserRequestToJoin
  }), [ handleUserRequestToJoin]);

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
};
