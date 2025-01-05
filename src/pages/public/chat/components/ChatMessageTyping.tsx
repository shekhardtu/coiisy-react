import React, { useRef } from "react";
import { ServerTypingUserInterface } from "../../coEditor/components/Editor.types";
import UsersAvatar from "../../coEditor/components/UsersAvatar";
import ChatMessageTime from "./ChatMessageTime";

const ChatMessageTyping = React.memo(
  ({
    isTyping = true,
    typingUsers = [],

  }: {
    isTyping: boolean
    typingUsers: ServerTypingUserInterface[]

  }) => {
    const messageBubbleRef = useRef<HTMLDivElement>(null)

    // Add a CSS class for transition
    const transitionClass = "transition-all duration-300 ease-in-out";

    return (
      <div className={`flex justify-start mb-1 relative group min-[59px]`}>
        <div
          className={`relative flex items-start gap-2 justify-center ${transitionClass}`}
          ref={messageBubbleRef}
        >
          <div className="flex flex-row gap-1">
            <div className="h-8 rounded-full self-start mr-2 transition-all duration-500 ease-in-out w-auto">
              <UsersAvatar users={typingUsers} />
            </div>
            <div className="flex flex-col gap-1">
              <div
                className={`max-w-xs w-auto px-4 py-2 rounded-2xl break-words bg-gray-50 text-gray-400 text-sm italic
                ${isTyping ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 ease-in-out
                transform ${isTyping ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-500 ease-in-out`}
              >
                {isTyping ? "Typing..." : ""}
              </div>
              <div
                className={`
                 overflow-hidden transition-all duration-200 flex items-center justify-end`}
              >
                <ChatMessageTime
                  message={undefined}
                  currentUser={undefined}
                  className="opacity-40 group-hover:opacity-100 transition-all duration-200"
                />


              </div>
            </div>

          </div>
        </div>
      </div>
    )
  }
)

export default ChatMessageTyping
