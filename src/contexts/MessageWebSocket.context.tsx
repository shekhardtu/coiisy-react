import { getCurrentTimeStamp, local } from "@/lib/utils";
import {
  WS_MESSAGE_TYPES
} from "@/lib/webSocket.config";
import { ChatMessageInterface, ServerSessionMessagesInterface } from "@/pages/public/coEditor/components/Editor.types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useWebSocket } from "./WebSocketContext";

interface MessageWebSocketContextType {

  editMessage: (messageId: string, newContent: string) => void
  deleteMessage: (messageId: string) => void
  reactToMessage: (messageId: string, emoji: string) => void
  removeReaction: (messageId: string, emoji: string) => void
  messages: ChatMessageInterface[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageInterface[]>>
  deduplicateMessages: (messages: ChatMessageInterface[]) => ChatMessageInterface[]
  lastMessageAction: React.MutableRefObject<string | null>
  removeMessage: (messageId: string) => void
  sendChatMessage: (content: string) => void
}

const MessageWebSocketContext =
  createContext<MessageWebSocketContextType | null>(null)

interface MessageWebSocketProviderProps {
  children: React.ReactNode
}

export const MessageWebSocketProvider: React.FC<
  MessageWebSocketProviderProps
> = ({ children }) => {
  const { sendMessage: wsSendMessage, currentUser, sessionId, subscribe } = useWebSocket()
  const [messages, setMessages] = useState<ChatMessageInterface[]>([])
  const lastMessageAction = useRef<string | null>(null);

  const sendChatMessage = useCallback(
    (content: string) => {
      if (!currentUser?.userId || !sessionId) {
        console.warn("Cannot send message: missing user or session data")
        return
      }

      const messageId = uuidv4()

      const messageData: ChatMessageInterface = {
        messageId,
        type: WS_MESSAGE_TYPES.CLIENT_CHAT,
        sessionId: sessionId,
        userId: currentUser.userId,
        fullName: currentUser.fullName || "",
        content,
        createdAt: getCurrentTimeStamp(),
      }

      // Update local messages immediately
      setMessages((prev) => [
        ...prev,
        { ...messageData, state: "sending" as const },
      ])

      try {
        // Send to websocket
        wsSendMessage(messageData)
        lastMessageAction.current = WS_MESSAGE_TYPES.CLIENT_CHAT;
        return messageData
      } catch (error) {
        console.error('Failed to send message:', error);
        // Update message state to failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg.messageId === messageId
              ? { ...msg, state: "failed" as const }
              : msg
          )
        );
      }
    },
    [currentUser, sessionId, wsSendMessage]
  )

  const deduplicateMessages = useCallback((messages: ChatMessageInterface[]): ChatMessageInterface[] => {
    const seen = new Map()
    return messages.filter((msg) => {
      if (seen.has(msg.messageId)) {
        return false
      }
      seen.set(msg.messageId, true)
      return true
    })
  }, [])

  const editMessage = useCallback(
    (messageId: string, newContent: string) => {
      if (!currentUser?.userId || !sessionId) return

      wsSendMessage({
        type: WS_MESSAGE_TYPES.CLIENT_CHAT_EDIT,
        messageId,
        content: newContent,
        userId: currentUser.userId,
        sessionId,
        createdAt: getCurrentTimeStamp(),
        fullName: currentUser?.fullName || "",
        state: "sending",
      })
    },
    [currentUser, sessionId, wsSendMessage]
  )

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!currentUser?.userId || !sessionId) return
      lastMessageAction.current = WS_MESSAGE_TYPES.CLIENT_CHAT_DELETE;

      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.messageId === messageId
            ? { ...msg, content: "Message has been deleted", state: 'deleted' }
            : msg
        )
      );

      wsSendMessage({
        type: WS_MESSAGE_TYPES.CLIENT_CHAT_DELETE,
        messageId,
        userId: currentUser.userId,
        sessionId,
        content: '',
        createdAt: getCurrentTimeStamp(),
        fullName: currentUser?.fullName || '',
        state: 'deleted',
      });
    },
    [currentUser, sessionId, wsSendMessage]
  )

  const reactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      if (!currentUser?.userId || !sessionId) return

      wsSendMessage({
        type: WS_MESSAGE_TYPES.CLIENT_CHAT_REACT,
        messageId,
        content: emoji,
        userId: currentUser.userId,
        sessionId,
        createdAt: getCurrentTimeStamp(),
        fullName: currentUser?.fullName || "",
        state: "sending",
      })
    },
    [currentUser, sessionId, wsSendMessage]
  )

  const removeReaction = useCallback(
    (messageId: string, emoji: string) => {

      if (!currentUser?.userId || !sessionId) return

      wsSendMessage({
        type: WS_MESSAGE_TYPES.CLIENT_CHAT_REACTION_REMOVE,
        messageId,
        userId: currentUser.userId,
        sessionId,
        content: emoji,
        createdAt: getCurrentTimeStamp(),
        fullName: currentUser?.fullName || "",
        state: "sending",
      })
    },
    [currentUser, sessionId, wsSendMessage]
  )



  const removeMessage = useCallback((messageId: string) => {

    setMessages(prevMessages => prevMessages.filter(msg => msg.messageId !== messageId))
    lastMessageAction.current = WS_MESSAGE_TYPES.CLIENT_CHAT_REMOVE;
    if (!currentUser?.userId || !sessionId) return
    wsSendMessage({
      type: WS_MESSAGE_TYPES.CLIENT_CHAT_REMOVE,
      messageId,
      userId: currentUser?.userId || '',
      sessionId,
      content: '',
      createdAt: getCurrentTimeStamp(),
      fullName: currentUser?.fullName || '',
      state: 'removed',
    });

  }, [currentUser, sessionId, wsSendMessage])




  const handleSessionReloadMessages = useCallback((session: ServerSessionMessagesInterface) => {
    lastMessageAction.current = WS_MESSAGE_TYPES.SERVER_SESSION_MESSAGES;
    setMessages((prevMessages) => {
        const allMessages = [...prevMessages, ...(session.messages || [])] as ChatMessageInterface[]
        const uniqueMessages = deduplicateMessages(allMessages)

        const sessionData = local("json", sessionId).get(`sessionIdentifier`);

        local("json", sessionId).set(`sessionIdentifier`, {
          ...sessionData,
          guestIdentifier: {
            ...currentUser,
            messages: uniqueMessages,
          },
        })
        return uniqueMessages
      })
    },
    [currentUser, sessionId, deduplicateMessages]
  )

  const handleServerChatDelete = useCallback(
    (message: ChatMessageInterface) => {
      lastMessageAction.current = WS_MESSAGE_TYPES.SERVER_CHAT_DELETE;
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.messageId === message.messageId
              ? message
            : msg
        )
      );
    },
    [setMessages]
  )

  const handleServerChatMessages = useCallback((message: ChatMessageInterface) => {
    lastMessageAction.current = WS_MESSAGE_TYPES.SERVER_CHAT;

    const sessionData = local("json", sessionId).get(`sessionIdentifier`);

    setMessages((prevMessages) => {
      let newMessages
      const existingMessageIndex = prevMessages.findIndex(
        (msg) => msg.messageId === message.messageId
      )

      if (existingMessageIndex !== -1) {
        newMessages = [...prevMessages]
        newMessages[existingMessageIndex] = { ...message  }
      } else {
        newMessages = [...prevMessages, { ...message }]
      }



      local("json", sessionId).set(`sessionIdentifier`, {
        ...sessionData,
        guestIdentifier: {
          ...currentUser,
          messages: newMessages,
        },
      })

      return newMessages
    })
  }, [currentUser, sessionId])



  useEffect(() => {
    const unsubscribeServerChatDelete = subscribe(WS_MESSAGE_TYPES.SERVER_CHAT_DELETE, handleServerChatDelete);

    const unsubscribeSessionReload = subscribe(
      WS_MESSAGE_TYPES.SERVER_SESSION_MESSAGES,
      handleSessionReloadMessages
    )

    const unsubscribeChat = subscribe(
      WS_MESSAGE_TYPES.SERVER_CHAT,
      handleServerChatMessages
    )

    return () => {
      unsubscribeServerChatDelete()
      unsubscribeSessionReload()
      unsubscribeChat()
    }
  }, [
    subscribe,
    handleServerChatDelete,
    handleServerChatMessages,
    handleSessionReloadMessages,
    sessionId,
    currentUser,
    deduplicateMessages,
    removeMessage,
    sendChatMessage
  ])

  const contextValue = useMemo(
    () => ({
      sendChatMessage,
      editMessage,
      deleteMessage,
      reactToMessage,
      removeReaction,
      messages,
      setMessages,
      deduplicateMessages,
      lastMessageAction,
      removeMessage
    }),
    [
      sendChatMessage,
      editMessage,
      deleteMessage,
      reactToMessage,
      removeReaction,
      messages,
      setMessages,
      deduplicateMessages,
      lastMessageAction,
      removeMessage
    ]
  )

  return (
    <MessageWebSocketContext.Provider value={contextValue}>
      {children}
    </MessageWebSocketContext.Provider>
  )
}

export const useMessageWebSocket = () => {
  const context = useContext(MessageWebSocketContext)
  if (!context) {
    throw new Error(
      "useMessageWebSocket must be used within a MessageWebSocketProvider"
    )
  }
  return context
}
