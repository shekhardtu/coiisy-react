import { useWebSocket } from '@/contexts/WebSocketContext';
import { getCurrentTimeStamp, local } from "@/lib/utils";
import { WS_MESSAGE_TYPES } from '@/lib/webSocket.config';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
import { AuthMessageInterface, ChatMessageInterface, ServerChatMessageInterface, ServerSessionMessagesInterface } from '../coEditor/components/Editor.types';
import useEditorContext from '../coEditor/hooks/useEditor.contexthook';
import ChatHeader from './components/ChatHeader';
import ChatInput from './components/ChatInput';
import ChatMessages from './components/ChatMessages';
import { CurrentUserInterface } from './components/chat.types';




export interface ChatPageProps {
  onSendMessage: (message: string) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ onSendMessage }) => {
  const [messages, setMessages] = useState<ServerChatMessageInterface[]>([]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { sessionId: urlSessionId } = useParams();
  const { sessionData, isJoinModalOpen } = useEditorContext();
  const { status, tryConnect, sendMessage, subscribe, setSessionId, sendAuthMessage, userJoinedSession } = useWebSocket();
  const { sessionId } = sessionData || {};
  const { guestIdentifier } = local("json", "key").get(`sessionIdentifier-${sessionId}`) || {};
  const currentUser: CurrentUserInterface = guestIdentifier;
  const [keyboardVisible, setKeyboardVisible] = useState(true);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    if (!isJoinModalOpen) {
      tryConnect();
    }
  }, [isJoinModalOpen, tryConnect]);

  useEffect(() => {
    setSessionId(sessionId || urlSessionId || null);
  }, [sessionId, setSessionId, urlSessionId]);

  useEffect(() => {
    if (currentUser && sessionId) {
      const authMessage: AuthMessageInterface = {
        type: WS_MESSAGE_TYPES.CLIENT_AUTH,
        sessionId,
        userId: currentUser.userId, // This is
      };

      sendAuthMessage(authMessage);
    }
  }, [currentUser, sendAuthMessage, sessionId]);

  useEffect(() => {
    if (sessionId && status === 'connected' && currentUser?.userId) {
      userJoinedSession({
        type: WS_MESSAGE_TYPES.CLIENT_USER_JOINED_SESSION,
        sessionId,
        userId: currentUser.userId,
        fullName: currentUser.fullName,
      });
    }
  }, [sessionId, userJoinedSession, status, currentUser?.userId, currentUser?.fullName]);

  useEffect(() => {
    const unsubscribeSessionReload = subscribe<ServerSessionMessagesInterface>(WS_MESSAGE_TYPES.SERVER_SESSION_MESSAGES, (data) => {
      const messagesToAdd = (data.messages || []).filter(msg =>
        msg && msg.createdAt && msg.userId && msg.content
      );

      setMessages(prevMessages => {
        const newMessages = messagesToAdd.reduce((acc, message) => {
          const isDuplicate = prevMessages.some(
            msg => msg.createdAt === message.createdAt &&
              msg.userId === message.userId &&
              msg.content === message.content
          );
          if (!isDuplicate) {
            acc.push(message as ServerChatMessageInterface);
          }
          return acc;
        }, [...prevMessages]);

        const sessionData = local("json", "key").get(`sessionIdentifier-${sessionId}`) || {};
        if (sessionData.guestIdentifier) {
          local("json", "key").set(`sessionIdentifier-${sessionId}`, {
            ...sessionData,
            updatedAt: getCurrentTimeStamp(),
            guestIdentifier: {
              ...sessionData.guestIdentifier,
              messages: newMessages
            }
          });
        }

        return newMessages;
      });
    });

    const unsubscribe = subscribe<ServerChatMessageInterface>(WS_MESSAGE_TYPES.SERVER_CHAT, (message) => {
      setMessages(prevMessages => {
        const isDuplicate = prevMessages.some(
          msg => msg.createdAt === message.createdAt &&
            msg.userId === message.userId &&
            msg.content === message.content
        );
        if (isDuplicate) return prevMessages;

        const newMessages = [...prevMessages, message];

        const sessionData = local("json", "key").get(`sessionIdentifier-${sessionId}`) || {};
        if (sessionData.guestIdentifier) {
          local("json", "key").set(`sessionIdentifier-${sessionId}`, {
            ...sessionData,
            updatedAt: getCurrentTimeStamp(),
            guestIdentifier: {
              ...sessionData.guestIdentifier,
              messages: newMessages
            }
          });
        }

        return newMessages;
      });
    });

    return () => {
      unsubscribe();
      unsubscribeSessionReload();
    };
  }, [status, subscribe, sessionId]);

  useEffect(() => {
    const sessionData = local("json", "key").get(`sessionIdentifier-${sessionId}`);
    if (sessionData && sessionData?.guestIdentifier?.messages) {
      setMessages(sessionData.guestIdentifier.messages);
    }
  }, [sessionId]);

  const scrollToBottom = useCallback((force = false) => {

    if (!chatContainerRef.current) return;

    const container = chatContainerRef.current;
    const { scrollHeight, scrollTop, clientHeight } = container;

    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (isNearBottom || force) {
      container.scrollTo({
        top: scrollHeight,
        behavior: force ? 'auto' : 'smooth',
      });

      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }


    }
  }, []);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes slideUpFade {
        0% {
          opacity: 0;
          transform: translateY(18px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newHeight = window.innerHeight;
      const newViewportHeight = window.visualViewport?.height || newHeight;
      setViewportHeight(newViewportHeight);

      const heightDiff = window.outerHeight - newViewportHeight;
      const isKeyboardLikelyVisible = heightDiff > 150;
      setKeyboardVisible(isKeyboardLikelyVisible);
    };

    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  useEffect(() => {
    const saved = local('json', 'key').get('editorFocusMode');
    setIsFocusMode(saved || false);
  }, [sessionData]);

  const handleSendMessage = (messageContent: string) => {
    const messageData: ChatMessageInterface = {
      type: WS_MESSAGE_TYPES.CLIENT_CHAT,
      sessionId: sessionId || '',
      userId: currentUser.userId,
      fullName: currentUser.fullName || '',
      content: messageContent,
      createdAt: getCurrentTimeStamp(),
    };

    sendMessage(messageData);
    scrollToBottom(true);
    onSendMessage(messageContent);
  };

  return (
    <div
      className={`flex flex-col inset-x-0 bg-background ${
        isFocusMode ? 'top-8' : 'top-14'
      }`}
      style={{
        bottom: 0,
        height: keyboardVisible
          ? `${viewportHeight}px`
          : `calc(100vh - ${isFocusMode ? '4rem' : '5.5rem'})`,
        maxHeight: '100vh',

      }}
    >
      <ChatHeader status={status} tryConnect={tryConnect} />
      <ChatMessages messages={messages} currentUser={currentUser} scrollToBottom={scrollToBottom}
        chatContainerRef={chatContainerRef}
        keyboardVisible={keyboardVisible}
      />
      <ChatInput status={status} onSendMessage={handleSendMessage}
        keyboardVisible={keyboardVisible}
      />
    </div>
  );
};

export default ChatPage;