// src/components/Chat.tsx
import { AuthMessageInterface, useWebSocket } from '@/contexts/WebSocketContext';
import { formatTimestamp, getCurrentTimeStamp, local } from "@/lib/utils";
import { Send } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useEditorContext from '../coEditor/hooks/useEditor.contexthook';
interface ChatPageProps {
  onSendMessage: (message: string) => void;
}

// Add base message interface
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

// Add chat message interface
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


  const { sessionId } = sessionData || {}


  useEffect(() => {
    setSessionId(sessionId || null);
  }, [sessionId, setSessionId]);

  const { guestIdentifier } = local("json", "key").get(`sessionIdentifier-${sessionId}`) || {};


  const currentUser = guestIdentifier;




  // UI state
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [showScrollPrompt, setShowScrollPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentUser) {
      const authMessage: AuthMessageInterface = {
        type: 'auth',
        userId: currentUser.userId,
        createdAt: getCurrentTimeStamp(),
      }
      sendAuthMessage(authMessage);
    }
    }, [currentUser, sendAuthMessage]);


  // join session
  useEffect(() => {
    if (sessionId && status === 'connected') {
      const joinSessionMessage: JoinSessionMessage = {
        type: 'user_joined_session',
        sessionId,
        userId: currentUser.userId,
        fullName: currentUser.fullName,
        createdAt: getCurrentTimeStamp()
      }
      sendMessage(joinSessionMessage);
    }
  }, [sessionId, currentUser?.userId, currentUser?.fullName, sendMessage, status]);

  // Combine connection and subscription into a single useEffect
  useEffect(() => {
    // Only try to connect if disconnected
    // if (status === 'disconnected' && wsConfig.enableStartupAutoConnect) {
    //   tryConnect();
    // }

    // Create subscription only once
    const unsubscribe = subscribe<ChatMessageInterface>('chat', (message) => {
      setMessages(prevMessages => {
        // Prevent duplicate messages by checking if message already exists
        const isDuplicate = prevMessages.some(
          msg => msg.createdAt === message.createdAt &&
                msg.userId === message.userId &&
                msg.content === message.content
        );
        if (isDuplicate) return prevMessages;

        const newMessages = [...prevMessages, message];

        // Update local storage
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

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [status, tryConnect, subscribe, sessionId]); // Remove unnecessary dependencies

  // Remove the separate initial messages loading effect
  // and combine it with the main effect
  useEffect(() => {
    const sessionData = local("json", "key").get(`sessionIdentifier-${sessionId}`);

    if (sessionData && sessionData?.guestIdentifier?.messages) {
      setMessages(sessionData.guestIdentifier.messages);
    }
  }, [sessionId]); // Only run once on mount

  // Scroll handling
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

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages, scrollToBottom]);

  // Message animation setup
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = messageAnimation;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);



  // Handle message sending
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

  return (
    <div className="flex flex-col max-h-screen overflow-hidden relative">
      {/* Fixed Header */}
      <div className="flex-none bg-background z-10 h-16">
        {/* Status indicator */}
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium">Chat</span>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              status === 'connected' ? 'bg-green-500' :
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

        {/* Connection warning */}
        {status === 'disconnected' && (
          <div className="p-2 bg-yellow-500/10 border-b border-yellow-500/20">
            <p className="text-xs text-center text-yellow-600">
              Connection lost. Messages won't be delivered until reconnected.
            </p>
          </div>
        )}
      </div>

      {/* Scrollable Messages Container */}
      <div className="flex-1 max-h-screen overflow-y-auto p-4 space-y-4 relative scroll-smooth scroll-h-screen">
        <div
          ref={chatContainerRef}
          className="flex-1  overflow-y-auto p-4 space-y-4 relative scroll-smooth min-h-screen"
        >
          {messages.map((msg, index) => {

          const isLastMessage = index === messages.length - 1;
          return (
            <div
              key={index}
              className={`flex ${msg.fullName === currentUser?.fullName ? 'justify-end' : 'justify-start'} ${
                isLastMessage ? 'animate-[slideUpFade_0.3s_ease-out]' : ''
              }`}
              style={{
                opacity: isLastMessage ? 0 : 1,
                animation: isLastMessage ? 'slideUpFade 0.3s ease-out forwards' : 'none',
              }}
            >
              <div
                className={`max-w-xs w-3/4 px-4 py-2 rounded-lg transition-all duration-200 ${
                  msg.fullName === currentUser?.fullName
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

      {/* New message prompt - Adjusted position */}
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

        </div>

      {/* Fixed Footer */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4 flex items-center
      mb-20">
        <input
          type="text"
          ref={inputRef}
          onKeyDown={handleKeyPress}
          placeholder={status === 'connected' ? "Type a message..." : "Connecting to chat..."}
          disabled={status !== 'connected'}
          className="flex-grow px-4 py-2 bg-input text-foreground rounded-full focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        <button
          onClick={handleSendMessage}
          disabled={status !== 'connected'}
          className="ml-2 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
