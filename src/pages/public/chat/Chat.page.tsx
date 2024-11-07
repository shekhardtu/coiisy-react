import { useWebSocket } from '@/contexts/WebSocketContext';
import { formatTimestamp, getCurrentTimeStamp, local } from "@/lib/utils";
import { WS_MESSAGE_TYPES } from '@/lib/webSocket.config';
import { Send } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
import {
  AuthMessageInterface,
  ChatMessageInterface,
  ServerChatMessageInterface,
  ServerSessionMessagesInterface
} from '../coEditor/components/Editor.types';
import useEditorContext from '../coEditor/hooks/useEditor.contexthook';



export interface ChatPageProps {
  onSendMessage: (message: string) => void;
}
const messageAnimation = `
@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

const ChatPage: React.FC<ChatPageProps> = ({ onSendMessage }) => {
  const { status, tryConnect, sendMessage, subscribe, setSessionId, sendAuthMessage, userJoinedSession } = useWebSocket();
  const [messages, setMessages] = useState<ServerChatMessageInterface[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sessionData } = useEditorContext();
  const { sessionId } = sessionData || {};
  const { guestIdentifier } = local("json", "key").get(`sessionIdentifier-${sessionId}`) || {};
  const currentUser = guestIdentifier;

  const [newMessageCount, setNewMessageCount] = useState(0);
  const [showScrollPrompt, setShowScrollPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { sessionId: urlSessionId } = useParams();

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    setSessionId(sessionId || urlSessionId || null);
  }, [sessionId, setSessionId, urlSessionId]);

  useEffect(() => {
    if (currentUser && sessionId) {
      const authMessage: AuthMessageInterface = {
        type: WS_MESSAGE_TYPES.CLIENT_AUTH,
        sessionId,
        userId: currentUser.userId,
        createdAt: getCurrentTimeStamp(),
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
      })
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
    if (!chatContainerRef.current || !messagesEndRef.current) return;

    const container = chatContainerRef.current;
    const { scrollHeight, scrollTop, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (isNearBottom || force) {
      messagesEndRef.current.scrollIntoView({
        behavior: force ? 'auto' : 'smooth',
        block: 'end',
      });

      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }

      clearTimeoutRef.current = setTimeout(() => {
        setNewMessageCount(0);
        setShowScrollPrompt(false);
      }, force ? 0 : 300);
    } else {
      setNewMessageCount(prev => prev + 1);
      setShowScrollPrompt(true);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = messageAnimation;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newHeight = window.innerHeight;
      setViewportHeight(newHeight);
      // If height decreased significantly, keyboard is likely visible
      setKeyboardVisible(newHeight < window.outerHeight * 0.75);
    };

    window.addEventListener('resize', handleResize);
    // For iOS Safari, we need these additional events
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputRef.current || !inputRef.current.value.trim() || status !== 'connected') return;

    const messageContent = inputRef.current.value.trim();
    const messageData: ChatMessageInterface = {
      type: WS_MESSAGE_TYPES.CLIENT_CHAT,
      sessionId: sessionId || '',
      userId: currentUser.userId,
      fullName: currentUser.fullName || '',
      content: messageContent,
      createdAt: getCurrentTimeStamp(),
    };

    sendMessage(messageData);
    inputRef.current.value = "";
    scrollToBottom(true);
    onSendMessage(messageContent);

    // Keep focus on input after sending
    if (keyboardVisible) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    const saved = local('json', 'key').get('editorFocusMode');
    setIsFocusMode(saved || false);
  }, [sessionData]);

  return (
    <div
      className={`flex flex-col fixed inset-x-0 bg-background ${
        keyboardVisible
          ? 'bottom-0' // Stick to bottom when keyboard is visible
          : 'bottom-8' // Normal position when keyboard is hidden
      } ${isFocusMode ? 'top-8' : 'top-14'}`}
      style={{
        // Use dynamic height when keyboard is visible
        height: keyboardVisible ? `${viewportHeight}px` : 'auto',
      }}
    >
      <div className="flex-none bg-background z-30 h-14 sm:h-16">
        <div className="px-3 sm:px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium">Chat</span>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' :
              status === 'connecting' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {status === 'connected' ? 'Connected' :
                  status === 'connecting' ? 'Connecting...' :
                    'Disconnected'}
              </span>
              {status === 'disconnected' && (
                <button
                  onClick={tryConnect}
                  className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                >
                  Reconnect
                </button>
              )}
            </div>
          </div>
        </div>

        {status === 'disconnected' && (
          <div className="p-2 bg-yellow-500/10 border-b border-yellow-500/20">
            <p className="text-xs text-center text-yellow-600">
              Connection lost. Messages won't be delivered until reconnected.
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto" ref={chatContainerRef}>
        <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
          {messages.map((msg, index) => {
            const isLastMessage = index === messages.length - 1;
            return (
              <div
                key={index}
                className={`flex ${msg.fullName === currentUser?.fullName ? 'justify-end' : 'justify-start'} ${isLastMessage ? 'animate-[slideUpFade_0.3s_ease-out]' : ''
                  }`}
                style={{
                  opacity: isLastMessage ? 0 : 1,
                  animation: isLastMessage ? 'slideUpFade 0.3s ease-out forwards' : 'none',
                }}
              >
                <div
                  className={`max-w-xs w-3/4 px-4 py-2 rounded-lg transition-all duration-200 ${msg.fullName === currentUser?.fullName
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-800 border border-gray-200'
                    }`}
                >
                  <p className="font-semibold text-xs opacity-70">{msg.fullName}</p>
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className="text-[10px] text-right mt-1 opacity-70">
                    {formatTimestamp(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} className="h-0" />
        </div>
      </div>

      {showScrollPrompt && (
        <div
          className="absolute bottom-36 left-1/2 -translate-x-1/2 cursor-pointer animate-[slideUpFade_0.2s_ease-out] z-20"
          onClick={() => scrollToBottom(true)}
        >
          <div className="bg-primary px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105">
            <span className="text-primary-foreground text-sm">
              {newMessageCount} new message{newMessageCount !== 1 ? 's' : ''}
            </span>
            <span className="text-primary-foreground animate-bounce">↓</span>
          </div>
        </div>
      )}

      <div className={`flex-none bg-background border-t border-border p-3 sm:p-4 ${
        keyboardVisible ? 'sticky bottom-0' : ''
      }`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 max-w-full"
        >
          <div className="relative flex-1">
            <input
              type="text"
              ref={inputRef}
              onKeyDown={handleKeyPress}
              placeholder={status === 'connected' ? "Type a message..." : "Connecting to chat..."}
              disabled={status !== 'connected'}
              aria-label="Chat message"
              className="w-full px-4 py-2.5 text-base bg-input text-foreground rounded-full
                focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50
                placeholder:text-muted-foreground/70"
            />
            {status === 'connected' && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50
                hidden [@media(hover:hover)]:inline-block" // Only show on devices with hover capability
              >
                Press Enter ↵
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={status !== 'connected'}
            aria-label="Send message"
            className="min-w-[44px] min-h-[44px] p-3 bg-primary text-primary-foreground rounded-full
              hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 hover:scale-105 active:scale-95
              flex items-center justify-center touch-manipulation"
          >
            <Send size={20} className="sm:w-5 sm:h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;