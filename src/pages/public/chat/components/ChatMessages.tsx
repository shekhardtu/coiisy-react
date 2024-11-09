import { cn } from '@/lib/utils';
import React, { memo, useEffect, useRef } from 'react';
import { ChatMessageInterface } from '../../coEditor/components/Editor.types';
import { CurrentUserInterface } from './chat.types';
import ChatMessage from './ChatMessage';

interface ChatMessagesProps {
  messages: ChatMessageInterface[];
  currentUser: CurrentUserInterface;
  scrollToBottom: (force?: boolean) => void;
  keyboardVisible: boolean;
  keyboardHeight: number;
  chatContainerRef: React.RefObject<HTMLDivElement>;
  className?: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, currentUser, scrollToBottom, chatContainerRef, keyboardVisible,
  keyboardHeight, className
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const windowHeight = useRef(window.innerHeight);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages, scrollToBottom]);


  useEffect(() => {
    console.log(keyboardVisible, keyboardHeight);
    console.log(`${windowHeight.current - (keyboardVisible ? (keyboardHeight ) : 120)}px`);
  }, [keyboardVisible, keyboardHeight]);



  return (
    <div
      className={cn("h-full", className)}
      ref={chatContainerRef}
    >
      <div className="space-y-3 sm:space-y-4 py-4 pb-20 mt-10">
        {messages.length > 0 && messages?.map((msg, index) => (
          <ChatMessage
            key={`${msg.createdAt}-${msg.userId}-${msg.messageId}`}
            message={msg}
            currentUser={currentUser}
            isNewMessage={index === messages.length - 1}
            previousMessage={index > 0 ? messages[index - 1] : undefined}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default memo(ChatMessages);
