import { useMessageWebSocket } from '@/contexts/MessageWebSocket.context';
import { useViewport } from '@/hooks/useViewport.hook';
import { cn } from '@/lib/utils';
import React, { memo, useEffect, useRef } from 'react';

import { WS_MESSAGE_TYPES } from '@/lib/webSocket.config';
import { useParams } from 'react-router-dom';
import { CurrentUserInterface } from '../../coEditor/components/Editor.types';
import { useOnlineUsers } from '../../coEditor/hooks/useOnlineUsers';
import ChatMessage from './ChatMessage';

interface ChatMessagesProps {
  currentUser: CurrentUserInterface;
  scrollToBottom: (force?: boolean) => void;
  chatContainerRef?: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ currentUser, scrollToBottom }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { keyboardVisible, isKeyboardSupported } = useViewport();
  const { messagesBySession, lastMessageAction } = useMessageWebSocket();
  const { sessionId } = useParams();
  const { activeUsers } = useOnlineUsers();

  // Get messages for current session

  const currentSessionMessages = messagesBySession.get(sessionId!) || [];


  useEffect(() => {
    if (currentSessionMessages.length > 0) {
      switch (lastMessageAction.current) {
        case WS_MESSAGE_TYPES.SERVER_CHAT_DELETE:
          break;
        case WS_MESSAGE_TYPES.SERVER_CHAT:
          setTimeout(() => scrollToBottom(false), 100);
          break;
        case WS_MESSAGE_TYPES.SERVER_SESSION_MESSAGES:
          setTimeout(() => scrollToBottom(true), 100);
          break;
        default:
          break;
      }
    }
  }, [currentSessionMessages.length, scrollToBottom, lastMessageAction]);

  return (
    <div className={cn("space-y-3 sm:space-y-4 p-4 w-full",
      `${keyboardVisible && !isKeyboardSupported && "pb-14"}`
    )} key={sessionId}>
      {currentSessionMessages.map((msg, index) => (
        <ChatMessage
          key={`${msg.createdAt}-${msg.userId}-${msg.messageId}-${msg.content}`}
          message={msg}
          currentUser={currentUser}
          isNewMessage={index === currentSessionMessages.length - 1}
          previousMessage={index > 0 ? currentSessionMessages[index - 1] : undefined}
          activeUsers={activeUsers}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default memo(ChatMessages);
