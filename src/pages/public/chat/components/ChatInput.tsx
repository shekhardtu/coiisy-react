import { Send } from "lucide-react";
import React, { useRef } from 'react';
import { ChatStatus } from './chat.types';

interface ChatInputProps {
  status: ChatStatus['status'];
  onSendMessage: (message: string) => void;
  keyboardVisible: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ status, onSendMessage, keyboardVisible }) => {

  const inputRef = useRef<HTMLInputElement>(null);



  const handleSendMessage = () => {
    if (!inputRef.current || !inputRef.current.value.trim() || status !== 'connected') return;

    const messageContent = inputRef.current.value.trim();
    onSendMessage(messageContent);
    inputRef.current.value = "";

    if (keyboardVisible) {
      inputRef.current.focus();
      // inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className={`
      flex-none bg-background border-t border-border p-3 sm:p-4 pb-8
      left-0 right-0
      bottom-8 sm:bottom-0
      sticky
      ${keyboardVisible ? 'bottom-0' : 'bottom-4'}
      z-[1000]
    `}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 max-w-full bg-background"
      >
        <div className="relative flex-1">
          <input
            type="text"
            ref={inputRef}
            onKeyDown={handleKeyPress}
            placeholder={status === 'connected' ? "Type a message..." : "Connecting to chat..."}
            aria-label="Chat message"
            className="w-full px-4 py-2.5 text-base bg-input text-foreground rounded-full
              focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50
              placeholder:text-muted-foreground/70"
          />
          {status === 'connected' && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50
              hidden [@media(hover:hover)]:inline-block"
            >
              Press Enter ↵
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (inputRef.current) {
              inputRef.current.focus();
            }
            handleSendMessage();
          }}
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
  );
};

export default ChatInput;