import React, { useEffect, useRef } from 'react';
import { ServerChatMessageInterface } from '../../coEditor/components/Editor.types';
import { CurrentUserInterface } from './chat.types';
import ChatMessage from './ChatMessage';

interface ChatMessagesProps {
  messages: ServerChatMessageInterface[];
  currentUser: CurrentUserInterface;
  scrollToBottom: (force?: boolean) => void;
  keyboardVisible: boolean;

  chatContainerRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, currentUser, scrollToBottom,  chatContainerRef , keyboardVisible}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages, scrollToBottom]);

  return (
    <div
      className="flex-1 overflow-y-auto overscroll-none"
      ref={chatContainerRef}
      style={{
        WebkitOverflowScrolling: 'touch',
        position: 'relative',
        paddingBottom: keyboardVisible ? '60px' : '0'
      }}
    >
      <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage
            key={`${msg.createdAt}-${msg.userId}-${msg.content}`}
            message={msg}
            currentUser={currentUser}
            isNewMessage={index === messages.length - 1}
            previousMessage={index > 0 ? messages[index - 1] : undefined}
          />
        ))}
        <div ref={messagesEndRef} className="h-0" />
      </div>
    </div>
  );
};

export default ChatMessages;