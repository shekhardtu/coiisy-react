import { Check, CheckCheck, Clock } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import {
  ChatMessageInterface,
  CurrentUserInterface,
  OnlineUserInterface,
} from "../../coEditor/components/Editor.types";
interface ChatMessageStateProps {
  message: ChatMessageInterface
  currentUser: CurrentUserInterface
  className?: string
  activeUsers: OnlineUserInterface[]
}

const ChatMessageState = ({
  message,
  currentUser,
  className,
  activeUsers,
}: ChatMessageStateProps) => {

  const [showBlue, setShowBlue] = useState(false)

  const messageStatus = useMemo(() => {
    if (!message?.state?.length) return "sending"

    // Check if any state is 'sending'
    if (message.state.some((state) => state.state === "sending")) {
      return "sending"
    }

    // Get all active users except current user
    const activeUsersIds = new Set(activeUsers.map((user) => user.userId))

    // Get all users who have received the message
    const deliveredUsersIds = new Set(
      message.state
        .filter((state) => state.state === "delivered")
        .map((state) => state.userId)
    )

    // Check if message is delivered to all active users
    const isFullyDelivered =
      activeUsersIds.size > 0 &&
      activeUsersIds.size === deliveredUsersIds.size &&
      [...activeUsersIds].every((userId) => deliveredUsersIds.has(userId))

    if (isFullyDelivered) {
      return "delivered"
    }

    // If message has any 'sent' state but not delivered to all
    if (message.state.some((state) => state.state === "sent")) {
      return "sent"
    }

    return "sending"
  }, [message.state, activeUsers])

  useEffect(() => {
    if (messageStatus === "delivered") {
      const timer = setTimeout(() => setShowBlue(true), 1000)
      return () => clearTimeout(timer)
    }
    setShowBlue(false)
  }, [messageStatus])

  if (message.userId !== currentUser?.userId) return null

  return (
    <div className={`flex items-center text-[10px] gap-1 ${className}`}>
      <span className="ml-0.5">
        {messageStatus === "sending" && (
          <span title="Message sending">
            <Clock size={12} className="text-gray-600" />
          </span>
        )}

        {messageStatus === "sent" && (
          <span title="Message sent">
            <Check size={12} className="text-gray-600" />
          </span>
        )}

        {messageStatus === "delivered" && (
          <span title="Message delivered">
            <CheckCheck
              size={12}
              strokeWidth={3}
              className={`transition-colors duration-300 font-bold ${
                showBlue ? "text-blue-600 animate-draw-checks" : "text-gray-600"
              }`}
            />
          </span>
        )}
      </span>
    </div>
  )
}

export default memo(ChatMessageState)
