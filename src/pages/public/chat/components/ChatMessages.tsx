import { useMessageWebSocket } from '@/contexts/MessageWebSocket.context';
import { useViewport } from '@/contexts/Viewport.context';
import { cn } from '@/lib/utils';
import React, { memo, useEffect, useRef } from 'react';

import { WS_MESSAGE_TYPES } from '@/lib/webSocket.config';
import { CurrentUserInterface } from './chat.types';
import ChatMessage from './ChatMessage';
interface ChatMessagesProps {
  currentUser: CurrentUserInterface;
  scrollToBottom: (force?: boolean) => void;
  chatContainerRef?: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({  currentUser, scrollToBottom,  }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { keyboardVisible, isKeyboardSupported} = useViewport()

  const { messages, lastMessageAction } = useMessageWebSocket();



  useEffect(() => {
    if (messages.length > 0) {
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
  }, [messages, scrollToBottom, lastMessageAction]);

  return (
    <div className={cn("space-y-3 sm:space-y-4 p-4 w-full",
      `${keyboardVisible && !isKeyboardSupported && "pb-14"}`
    )}>
      {messages.length > 0 && messages?.map((msg, index) => (
        <ChatMessage
          key={`${msg.createdAt}-${msg.userId}-${msg.messageId}-${msg.content}`}
          message={msg}
          currentUser={currentUser}
          isNewMessage={index === messages.length - 1}
          previousMessage={index > 0 ? messages[index - 1] : undefined}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default memo(ChatMessages);
