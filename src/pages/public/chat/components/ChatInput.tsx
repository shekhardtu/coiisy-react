import { useMessageWebSocket } from "@/contexts/MessageWebSocket.context";
import { useViewport } from "@/contexts/Viewport.context";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { ChatStatus, SessionStatusInterface } from "./chat.types";
import ChatInputInfoBar from "./ChatInputInfoBar";

interface ChatInputProps {
  status: ChatStatus["status"]
  sessionStatus: SessionStatusInterface["sessionStatus"]
  scrollToBottom?: () => void
  tryConnect: () => void
}
const ChatInput: React.FC<ChatInputProps> = ({
  status,
  sessionStatus,
  scrollToBottom,
  tryConnect,
}) => {
  const {
    sendChatMessage,
    editMessage,
    editingMessageId,
    editingMessageContent,
    markMessageAsEditing,
  } = useMessageWebSocket();

  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  // Update input value when editingMessageContent changes
  useEffect(() => {
    if (editingMessageContent !== null) {
      setInputValue(editingMessageContent);
    }
  }, [editingMessageContent]);

  const handleSendMessage = () => {
    if (!inputRef.current || !inputRef.current.value.trim() || status !== "connected") return;

    const messageContent = inputRef.current.value.trim();

    if (editingMessageId) {
      // If editing, send edit message
      editMessage(editingMessageId, messageContent);
      markMessageAsEditing(null); // Reset editing state
    } else {
      // Otherwise, send a new message
      sendChatMessage(messageContent);
    }

    if (scrollToBottom) {
      scrollToBottom();
    }
    setInputValue(""); // Clear input after sending
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    handleSendMessage();
  };
  const { keyboardVisible, isKeyboardSupported } = useViewport()

  return (
    <div className="relative">
      <ChatInputInfoBar
        tryConnect={tryConnect}
        status={status}
        sessionStatus={sessionStatus}
      />
      <div
        className={cn(
          "bg-background p-3 sm:p-4 w-full border-t border-border sticky bottom-8 transition-all duration-800",
          `${
            keyboardVisible &&
            !isKeyboardSupported &&
            "mb-[env(keyboard-inset-height,0)] pb-14 fixed bottom-0"
          }`,
          "z-40 flex-none"
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
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                status === "connected"
                  ? editingMessageId
                    ? "Editing message..."
                    : "Type a message..."
                  : "Connecting to chat..."
              }
              aria-label="Chat message"
              className={cn(
                "w-full px-4 py-2.5 text-base rounded-full focus:outline-none focus:ring-2 disabled:opacity-50 placeholder:text-muted-foreground/70",
                editingMessageId ? "bg-yellow-100 border-yellow-500" : "bg-input text-foreground"
              )}
            />
            {status === "connected" && (
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50
                hidden [@media(hover:hover)]:inline-block"
              >
                Press Enter ↵
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSendMessage();
              inputRef.current?.focus();
            }}
            disabled={status !== "connected"}
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
  )
}

export default ChatInput
