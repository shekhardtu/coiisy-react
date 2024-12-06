import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { useMessageWebSocket } from "@/contexts/MessageWebSocket.context";
import { MoreVertical } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChatMessageInterface,
  CurrentUserInterface,
  OnlineUserInterface,
} from "../../coEditor/components/Editor.types";
import UserAvatar from "../../coEditor/components/UserAvatar";
import ChatMessageActions from "./ChatMessageActions";
import ChatMessageState from "./ChatMessageState";
import ChatMessageTime from "./ChatMessageTime";

const ChatMessage = React.memo(
  ({
    message,
    currentUser,
    previousMessage,
    activeUsers,
  }: {
    message: ChatMessageInterface
    currentUser: CurrentUserInterface
    isNewMessage?: boolean
    previousMessage?: ChatMessageInterface
    activeUsers: OnlineUserInterface[]
    }) => {

    // const longPressHandlers = useLongPress(() => {
    //   setIsOpen(!isOpen)
    // })
    const isOwnMessage = message.userId === currentUser?.userId
    const [isOpen, setIsOpen] = useState(false)
    const [user, setUser] = useState<OnlineUserInterface>()
      const messageBubbleRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
      const foundUser = activeUsers.find(user => user.userId === message.userId)
      setUser(foundUser || {
        initials: message.fullName?.slice(0, 2),
        fullName: message.fullName,
        isOnline: false,
        userId: message.userId,
        isShow: true,
        connectedAt: new Date(),
        lastSeenAt: new Date(),
      })
    }, [message.userId, message.fullName, activeUsers])
    const { deleteMessage, removeMessage } = useMessageWebSocket()

    const chatMessageActionProps = useMemo(() => ({
      message,
      isOwnMessage,
      isOpen,
      onClose: () => setIsOpen(false),
      deleteMessage,
      removeMessage,
    }), [message, isOwnMessage, isOpen, deleteMessage, removeMessage])

    const chatMessageStateProps = useMemo(() => ({
      activeUsers,
      message,
      currentUser,
    }), [activeUsers, message, currentUser])



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
              {...chatMessageActionProps}
            />
          </Popover>

          <div className="flex flex-row gap-1">
            {message.userId !== currentUser?.userId &&
              (!previousMessage || previousMessage.userId !== message.userId) ?

              <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 self-start mr-2">
                <UserAvatar user={user} />
              </div>
              : (
                <div className="w-8 h-8 rounded-full flex-shrink-0 self-start mr-2" />
              )
            }
            <div className="flex flex-col gap-1">
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  setIsOpen(!isOpen)
                }}
                className={`max-w-xs w-auto px-4 py-2 rounded-2xl ${
                  Array.isArray(message?.state) && message.state.find((state) => state?.state === "deleted")
                    ? "bg-gray-50 text-gray-400 text-sm italic px-2 py-1"
                    : isOwnMessage
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-gray-100 text-gray-800 rounded-tl-sm"
                }`}
              >
                {Array.isArray(message?.state) && message.state.find((state) => state?.state === "deleted")
                  ? "This message was deleted"
                  : message.content}
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
                  {...chatMessageStateProps}
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
