import { AuthMessageInterface, useWebSocket } from '@/contexts/WebSocketContext';
import { formatTimestamp, getCurrentTimeStamp, local } from "@/lib/utils";
import { Send } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useEditorContext from '../coEditor/hooks/useEditor.contexthook';

interface ChatPageProps {
  onSendMessage: (message: string) => void;
}

interface BaseMessage {
  type: string;
  createdAt: string | Date;
}

interface JoinSessionMessage extends BaseMessage {
  type: 'user_joined_session';
  sessionId: string;
  userId: string;
  fullName: string;
  createdAt: string | Date;
}

interface ChatMessageInterface extends BaseMessage {
  type: 'chat';
  sessionId: string;
  userId: string;
  fullName: string;
  content: string;
  createdAt: string | Date;
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
  const { status, tryConnect, sendMessage, subscribe, setSessionId, sendAuthMessage } = useWebSocket();
  const [messages, setMessages] = useState<ChatMessageInterface[]>([]);
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

  useEffect(() => {
    setSessionId(sessionId || null);
  }, [sessionId, setSessionId]);

  useEffect(() => {
    if (currentUser) {
      const authMessage: AuthMessageInterface = {
        type: 'auth',
        userId: currentUser.userId,
        createdAt: getCurrentTimeStamp(),
      };
      sendAuthMessage(authMessage);
    }
  }, [currentUser, sendAuthMessage]);

  useEffect(() => {
    if (sessionId && status === 'connected') {
      const joinSessionMessage: JoinSessionMessage = {
        type: 'user_joined_session',
        sessionId,
        userId: currentUser.userId,
        fullName: currentUser.fullName,
        createdAt: getCurrentTimeStamp()
      };
      sendMessage(joinSessionMessage);
    }
  }, [sessionId, currentUser?.userId, currentUser?.fullName, sendMessage, status]);

  useEffect(() => {
    const unsubscribe = subscribe<ChatMessageInterface>('chat', (message) => {
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

  const handleSendMessage = () => {
    if (!inputRef.current || !inputRef.current.value.trim() || status !== 'connected') return;

    const messageData: ChatMessageInterface = {
      type: 'chat',
      sessionId: sessionId || '',
      userId: currentUser.userId,
      fullName: currentUser.fullName || '',
      content: inputRef.current.value.trim(),
      createdAt: getCurrentTimeStamp(),
    };

    sendMessage(messageData);
    inputRef.current.value = "";
    scrollToBottom(true);
    onSendMessage(inputRef.current.value.trim());
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
    <div className={`flex flex-col fixed inset-x-0 bottom-8 bg-background ${isFocusMode ? 'top-8' : 'top-14'
      }`}>
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

      <div className="flex-none bg-background border-t border-border p-2 sm:p-4">
        <div className="flex items-center max-w-full">
          <input
            type="text"
            ref={inputRef}
            onKeyDown={handleKeyPress}
            placeholder={status === 'connected' ? "Type a message..." : "Connecting to chat..."}
            disabled={status !== 'connected'}
            className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-input text-foreground rounded-full focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={status !== 'connected'}
            className="ml-2 bg-primary text-primary-foreground p-1.5 sm:p-2 rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            <Send size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;