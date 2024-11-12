import { useViewport } from '@/contexts/Viewport.context';
import { cn } from '@/lib/utils';
import React, { memo, useContext, useEffect, useRef } from 'react';
import { ChatMessageInterface } from '../../coEditor/components/Editor.types';
import { EditorContext } from '../../coEditor/contexts/Editor.context';
import { CurrentUserInterface } from './chat.types';
import ChatMessage from './ChatMessage';

interface ChatMessagesProps {
  messages: ChatMessageInterface[];
  currentUser: CurrentUserInterface;
  scrollToBottom: (force?: boolean) => void;
  chatContainerRef: React.RefObject<HTMLDivElement>;

}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, currentUser, scrollToBottom, chatContainerRef }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { keyboardVisible, isKeyboardSupported} = useViewport()
  const editorContext = useContext(EditorContext);

  if (!editorContext) {
    throw new Error('ChatMessages must be used within EditorProvider');
  }

  const { handleHeaderVisibility } = editorContext;

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      handleHeaderVisibility(container);

    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [chatContainerRef, handleHeaderVisibility]);

  return (
    <div className={cn("space-y-3 sm:space-y-4 p-4 w-full",
      `${keyboardVisible && !isKeyboardSupported && "pb-14"}`
    )}>
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
  );
};

export default memo(ChatMessages);
