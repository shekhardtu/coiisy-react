import { Send } from "lucide-react";
import React, { useEffect, useRef } from 'react';
import { ChatStatus } from './chat.types';

// Add this interface near the top of the file with other interfaces
interface NavigatorWithKeyboard extends Navigator {
  virtualKeyboard: {
    addEventListener(arg0: string, handleGeometryChange: () => void): unknown;
    removeEventListener(arg0: string, handleGeometryChange: () => void): void;
    show(): void;
    hide(): void;
    overlaysContent: boolean;
    boundingRect: DOMRect;
  };
}

interface ChatInputProps {
  status: ChatStatus['status'];
  onSendMessage: (message: string) => void;
  keyboardVisible: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ status, onSendMessage, keyboardVisible }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ('virtualKeyboard' in navigator) {
      const keyboard = (navigator as NavigatorWithKeyboard).virtualKeyboard;
      keyboard.overlaysContent = true;
    }
  }, []);

  const handleSendMessage = () => {
    if (!inputRef.current || !inputRef.current.value.trim() || status !== 'connected') return;

    const messageContent = inputRef.current.value.trim();
    onSendMessage(messageContent);
    inputRef.current.value = "";

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





  return (
    <div className={`flex-none bg-background border-t border-border p-3 pb-7 sm:p-4
      ${ keyboardVisible ? 'sticky bottom-0' : 'pb-3'}`}>
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
          type="button"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();

            // First focus the input
            if (inputRef.current) {
              inputRef.current.focus();
            }

            // Then handle the message
            handleSendMessage();

            // Finally show keyboard if supported
            if ('virtualKeyboard' in navigator) {
              const keyboard = (navigator as NavigatorWithKeyboard).virtualKeyboard;
              keyboard.show();
            }
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