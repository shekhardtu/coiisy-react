import { useViewport } from "@/contexts/Viewport.context";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { cn, getCurrentTimeStamp, local } from "@/lib/utils";
import { WS_MESSAGE_TYPES } from "@/lib/webSocket.config";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "../cat/style.css";
import {
  AuthMessageInterface,
  ChatMessageInterface,
  ServerChatMessageInterface,
  ServerSessionMessagesInterface,
} from "../coEditor/components/Editor.types";
import useEditorContext from "../coEditor/hooks/useEditor.contexthook";
import { CurrentUserInterface } from "./components/chat.types";
import ChatHeader from "./components/ChatHeader";
import ChatInput from "./components/ChatInput";
import ChatMessages from "./components/ChatMessages";

interface NavigatorWithVirtualKeyboard extends Navigator {
  virtualKeyboard?: {
    show: () => void
    overlaysContent: boolean
  }
}

export interface ChatPageProps {
  onSendMessage: (message: string) => void
}

const ChatPage: React.FC<ChatPageProps> = ({ onSendMessage }) => {
  const [messages, setMessages] = useState<ChatMessageInterface[]>([])


  const chatContainerRef = useRef<HTMLDivElement>(null)

  const { sessionId } = useParams()
  const { isJoinModalOpen } = useEditorContext()
  const {
    status,
    tryConnect,
    sendMessage,
    subscribe,
    setSessionId,
    sendAuthMessage,
    userJoinedSession,
  } = useWebSocket()

  const { keyboardVisible, isKeyboardSupported } = useViewport()

  const { guestIdentifier } =
    local("json", "key").get(`sessionIdentifier-${sessionId}`) || {}
  const currentUser: CurrentUserInterface = guestIdentifier

  // Virtual Keyboard setup
  useEffect(() => {
    const virtualKeyboard = (navigator as NavigatorWithVirtualKeyboard)
      .virtualKeyboard
    if (!virtualKeyboard) return
    virtualKeyboard.overlaysContent = true
  }, [])

  useEffect(() => {
    if (!isJoinModalOpen) {
      tryConnect()
    }
  }, [isJoinModalOpen])

  useEffect(() => {
    if (sessionId) {
      setSessionId(sessionId)
    }
  }, [sessionId, setSessionId])

  useEffect(() => {
    if (currentUser && sessionId) {
      const authMessage: AuthMessageInterface = {
        type: WS_MESSAGE_TYPES.CLIENT_AUTH,
        sessionId,
        userId: currentUser.userId, // This is
      }

      sendAuthMessage(authMessage)
    }
  }, [currentUser, sendAuthMessage, sessionId])

  useEffect(() => {
    if (sessionId && status === "connected" && currentUser?.userId) {
      userJoinedSession({
        type: WS_MESSAGE_TYPES.CLIENT_USER_JOINED_SESSION,
        sessionId,
        userId: currentUser.userId,
        fullName: currentUser.fullName,
      })
    }
  }, [
    sessionId,
    userJoinedSession,
    status,
    currentUser?.userId,
    currentUser?.fullName,
  ])

  const deduplicateMessages = (
    messages: ChatMessageInterface[]
  ): ChatMessageInterface[] => {
    const seen = new Map()
    return messages.filter((msg) => {
      if (seen.has(msg.messageId)) {
        return false
      }
      seen.set(msg.messageId, true)
      return true
    })
  }

  useEffect(() => {
    const unsubscribeSessionReload = subscribe<ServerSessionMessagesInterface>(
      WS_MESSAGE_TYPES.SERVER_SESSION_MESSAGES,
      (data) => {
        setMessages((prevMessages) => {
          const allMessages = [
            ...prevMessages,
            ...data.messages,
          ] as ChatMessageInterface[]
          const uniqueMessages = deduplicateMessages(allMessages)

          local("json", "key").set(`sessionIdentifier-${sessionId}`, {
            guestIdentifier: {
              ...currentUser,
              messages: uniqueMessages,
            },
          })

          return uniqueMessages
        })
      }
    )

    const unsubscribe = subscribe<ServerChatMessageInterface>(
      WS_MESSAGE_TYPES.SERVER_CHAT,
      (message) => {
        setMessages((prevMessages) => {
          let newMessages
          const existingMessageIndex = prevMessages.findIndex(
            (msg) => msg.messageId === message.messageId
          )

          if (existingMessageIndex !== -1) {
            // Update existing message state
            newMessages = [...prevMessages]
            newMessages[existingMessageIndex] = {
              ...message,
              state: "sent" as const,
            }
          } else {
            // Add new message
            newMessages = [
              ...prevMessages,
              { ...message, state: "sent" as const },
            ]
          }

          // Save to localStorage for both cases
          local("json", "key").set(`sessionIdentifier-${sessionId}`, {
            guestIdentifier: {
              ...currentUser,
              messages: newMessages,
            },
          })

          return newMessages
        })
      }
    )

    return () => {
      unsubscribe()
      unsubscribeSessionReload()
    }
  }, [status, subscribe, sessionId, currentUser])

  useEffect(() => {
    const sessionData = local("json", "key").get(
      `sessionIdentifier-${sessionId}`
    )
    if (sessionData?.guestIdentifier?.messages) {
      setMessages(deduplicateMessages(sessionData.guestIdentifier.messages))
    }
    return () => {
      setMessages([])
    }
  }, [sessionId])

  const scrollToBottom = useCallback((force = false) => {
    if (!chatContainerRef.current) return

    const container = chatContainerRef.current
    const { scrollHeight, scrollTop, clientHeight } = container
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

    if (isNearBottom || force) {
      container.scrollTo({
        top: scrollHeight,
        behavior: "smooth",
      })
    }
  }, [])

  useEffect(() => {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = `
      @keyframes slideUp {
        0% {
          opacity: 0;
          transform: translateY(20px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-slideUp {
        animation: slideUp 0.3s ease-out forwards;
      }
    `
    document.head.appendChild(styleSheet)

    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [])

  const handleSendMessage = (messageContent: string) => {
    if (!messageContent || !currentUser) return

    const messageId = uuidv4()
    const messageData: ChatMessageInterface = {
      messageId,
      type: WS_MESSAGE_TYPES.CLIENT_CHAT,
      sessionId: sessionId || "",
      userId: currentUser.userId,
      fullName: currentUser.fullName || "",
      content: messageContent,
      createdAt: getCurrentTimeStamp(),
    }

    setMessages((prev) => [
      ...prev,
      { ...messageData, state: "sending" as const },
    ])
    sendMessage(messageData)
    scrollToBottom(true)
    onSendMessage(messageContent)
  }

  // Add viewport height adjustment effect
  useEffect(() => {
    const setViewportHeight = () => {
      document.documentElement.style.setProperty(
        "--100vh",
        `${window.innerHeight}px`
      );
    }

    // Set initial height
    setViewportHeight()

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(setViewportHeight, 100)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])





  return (
    <div className="chat_container" role="main" aria-label="Chat interface">
      <ChatHeader
        status={status}
        tryConnect={tryConnect}
        className={cn(
          "flex-none border-b border-border header top-0 left-0 right-0 z-50",
          `${keyboardVisible && !isKeyboardSupported && "mb-[env(keyboard-inset-height,0)] fixed"}`
        )}
      />

      <div
        ref={chatContainerRef}
        className={`messages overflow-y-scroll`}
        role="log"
        aria-live="polite"
      >
        <ChatMessages
          messages={messages}
          currentUser={currentUser}
          chatContainerRef={chatContainerRef}
          scrollToBottom={scrollToBottom}
        />
      </div>

      <div className="compose" role="form" aria-label="Message composition">
        <ChatInput
          status={status}
          onSendMessage={handleSendMessage}
          scrollToBottom={scrollToBottom}
          tryConnect={tryConnect}
        />
      </div>
    </div>
  )
}

export default ChatPage
