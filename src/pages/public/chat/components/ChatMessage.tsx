import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { MoreVertical } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  ChatMessageInterface,
  CurrentUserInterface,
  OnlineUserInterface,
} from "../../coEditor/components/Editor.types";
import UserAvatar from "../../coEditor/components/UserAvatar";
import { useOnlineUsers } from "../../coEditor/hooks/useOnlineUsers";
import ChatMessageActions from "./ChatMessageActions";
import ChatMessageState from "./ChatMessageState";
import ChatMessageTime from "./ChatMessageTime";

const ChatMessage = React.memo(
  ({
    message,
    currentUser,
    previousMessage,
  }: {
    message: ChatMessageInterface
    currentUser: CurrentUserInterface
    isNewMessage?: boolean
    previousMessage?: ChatMessageInterface
    }) => {
    // const longPressHandlers = useLongPress(() => {
    //   setIsOpen(!isOpen)
    // })
    const isOwnMessage = message.userId === currentUser?.userId
    const [isOpen, setIsOpen] = useState(false)
    const [user, setUser] = useState<OnlineUserInterface>()
    const { sessionId } = useWebSocket()
    const messageBubbleRef = useRef<HTMLDivElement>(null)
    const { users } = useOnlineUsers({ minutes: 120, sessionId: sessionId })
    useEffect(() => {
      setUser(users.find((user) => user.userId === message.userId))
    }, [message.userId, users])



    return (
      <div
        className={`flex ${
          isOwnMessage ? "justify-end" : "justify-start"
          } mb-1 relative group`}

      >
        <div
          className="relative flex items-start gap-2 justify-center "
          ref={messageBubbleRef}

        >
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <button
                className={`opacity-0 group-hover:opacity-100 transition-all duration-200
                  p-1.5 hover:bg-gray-100 rounded-full absolute top-0
                  ${isOpen ? "opacity-100 bg-gray-100" : ""}
                   active:scale-95 z-10`}
                style={{
                  [isOwnMessage ? "right" : "left"]: `${
                    (messageBubbleRef.current?.offsetWidth ?? 0) + 4
                  }px`,
                }}
              >
                <MoreVertical size={16} className="text-gray-500" />
              </button>
            </PopoverTrigger>
            <ChatMessageActions
              message={message}
              isOwnMessage={isOwnMessage}
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
            />
          </Popover>

          <div className="flex flex-row gap-1">
            {message.userId !== currentUser?.userId &&
            (!previousMessage || previousMessage.userId !== message.userId) &&
            message.state?.find((state) => state.state === "deleted" && state.messageMongoId === message._id) ? (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 self-start mr-2">
                <UserAvatar user={user} />
              </div>
            ) : (
              !isOwnMessage && message.state?.find((state) => state.state !== "deleted") && (
                <div className="w-8 h-8 rounded-full flex-shrink-0 self-start mr-2" />
              )
            )}
            <div className="flex flex-col gap-1">
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  setIsOpen(!isOpen)
                }}
                className={`max-w-xs w-auto px-4 py-2 rounded-2xl ${
                  message.state?.find((state) => {

                    return state.state === "deleted" && state.userId === currentUser?.userId
                  })
                    ? "bg-gray-50 text-gray-400 text-sm italic px-2 py-1"
                    : isOwnMessage
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-gray-100 text-gray-800 rounded-tl-sm"
                }`}
              >
                {message.state?.find((state) => state.state === "deleted") ? "This message was deleted" : message.content}
              </div>
              <div
                className={`
                 overflow-hidden transition-all duration-200 flex items-center, ${
                  message.userId === currentUser?.userId ? 'justify-end' : 'justify-start'
                }`}
              >
                <ChatMessageTime
                  message={message}
                  currentUser={currentUser}
                  className="opacity-40 group-hover:opacity-100 transition-all duration-200"
                />
                <ChatMessageState
                  message={message}
                  currentUser={currentUser}
                  className="transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export default ChatMessage
