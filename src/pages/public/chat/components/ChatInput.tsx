import { cn } from '@/lib/utils';
import { Send } from "lucide-react";
import React, { useRef } from 'react';
import { ChatStatus } from './chat.types';

interface ChatInputProps {
  status: ChatStatus['status'];
  onSendMessage: (message: string) => void;
  keyboardVisible: boolean;
  keyboardHeight: number;
  tryConnect: () => void;

}

  const ChatInput: React.FC<ChatInputProps> = ({ status, onSendMessage, keyboardVisible, tryConnect }) => {

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (!inputRef.current || !inputRef.current.value.trim() || status !== 'connected') return;

    const messageContent = inputRef.current.value.trim();
    onSendMessage(messageContent);
    inputRef.current.value = "";
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    handleSendMessage();
  };


    return (
    <div className='relative' >

        {status === "disconnected" && (
        <div className="p-2 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center justify-center">
          <p className="text-xs text-center text-yellow-600 mr-2">
            Connection lost. Messages won't be delivered until reconnected.
          </p>
          <button
            onClick={tryConnect}
            className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Reconnect
          </button>
        </div>
      )}
    <div
      className={cn(
        "bg-background p-3 sm:p-4 w-full border-t border-border sticky bottom-0 transition-all duration-800",
        keyboardVisible ? 'bottom-0 left-0 right-0 mb-[env(keyboard-inset-height,0)] pb-16':
        "z-40 flex-none",
        )}
    >
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
            onBlur={() => {
              if (keyboardVisible) {
                inputRef.current?.blur();
              }
            }}
            placeholder={status === 'connected' ? "Type a message..." : "Connecting to chat..."}
            aria-label="Chat message"
            className="w-full px-4 py-2.5 text-base bg-input text-foreground rounded-full
              focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50
              placeholder:text-muted-foreground/70"
          />
          {status === 'connected' && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50
              hidden [@media(hover:hover)]:inline-block">
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
        </div>
  );
};

export default ChatInput;