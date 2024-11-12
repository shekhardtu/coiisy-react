import { getCurrentTimeStamp } from '@/lib/utils';
import { WS_CLIENT_MESSAGE_TYPES, WS_MESSAGE_TYPES } from '@/lib/webSocket.config';
import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useWebSocket } from './WebSocketContext';


interface MessageWebSocketContextType {
  sendMessage: (content: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string) => void;
  reactToMessage: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
}

const MessageWebSocketContext = createContext<MessageWebSocketContextType | null>(null);

interface MessageWebSocketProviderProps {
  children: React.ReactNode;
}

export const MessageWebSocketProvider: React.FC<MessageWebSocketProviderProps> = ({ children }) => {
  const { sendMessage: wsSendMessage, currentUser, sessionId } = useWebSocket();

  const sendMessage = useCallback((content: string) => {
    if (!currentUser?.userId || !sessionId) {
      console.warn('Cannot send message: missing user or session data');
      return;
    }

    wsSendMessage({
      type: WS_MESSAGE_TYPES.CLIENT_CHAT,
      content,
      userId: currentUser.userId,
      sessionId,
      createdAt: getCurrentTimeStamp(),
      fullName: currentUser?.fullName || '',
      messageId: uuidv4(),
    });
  }, [currentUser, sessionId, wsSendMessage]);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    if (!currentUser?.userId || !sessionId) return;

    wsSendMessage({
      type: WS_MESSAGE_TYPES.CLIENT_CHAT_EDIT,
      messageId,
      content: newContent,
      userId: currentUser.userId,
      sessionId,
      createdAt: getCurrentTimeStamp(),
      fullName: currentUser?.fullName || '',
      state: 'sending',
    });
  }, [currentUser, sessionId, wsSendMessage]);

  const deleteMessage = useCallback((messageId: string) => {
    if (!currentUser?.userId || !sessionId) return;

    wsSendMessage({
      type: WS_MESSAGE_TYPES.CLIENT_CHAT_DELETE,
      messageId,
      userId: currentUser.userId,
      sessionId,
      content: '',
      createdAt: getCurrentTimeStamp(),
      fullName: currentUser?.fullName || '',
      state: 'deleted',
    });
  }, [currentUser, sessionId, wsSendMessage]);

  const reactToMessage = useCallback((messageId: string, emoji: string) => {
    if (!currentUser?.userId || !sessionId) return;

    wsSendMessage({
      type: WS_MESSAGE_TYPES.CLIENT_CHAT_REACT,
      messageId,
      content: emoji,
      userId: currentUser.userId,
      sessionId,
      createdAt: getCurrentTimeStamp(),
      fullName: currentUser?.fullName || '',
      state: 'sending',
    });
  }, [currentUser, sessionId, wsSendMessage]);

  const removeReaction = useCallback((messageId: string, emoji: string) => {
    if (!currentUser?.userId || !sessionId) return;

    wsSendMessage({
      type: WS_CLIENT_MESSAGE_TYPES.CLIENT_CHAT_REACTION_REMOVE,
      messageId,
      userId: currentUser.userId,
      sessionId,
      content: emoji,
      createdAt: getCurrentTimeStamp(),
      fullName: currentUser?.fullName || '',
      state: 'sending',
    });
  }, [currentUser, sessionId, wsSendMessage]);

  const contextValue = useMemo(() => ({
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    removeReaction,
  }), [sendMessage, editMessage, deleteMessage, reactToMessage, removeReaction]);

  return (
    <MessageWebSocketContext.Provider value={contextValue}>
      {children}
    </MessageWebSocketContext.Provider>
  );
};

export const useMessageWebSocket = () => {
  const context = useContext(MessageWebSocketContext);
  if (!context) {
    throw new Error('useMessageWebSocket must be used within a MessageWebSocketProvider');
  }
  return context;
};
