import { getCurrentTimeStamp, local } from "@/lib/utils";
import {
  WS_MESSAGE_TYPES
} from "@/lib/webSocket.config";
import { SessionStatusInterface } from "@/pages/public/chat/components/chat.types";
import { ChatMessageInterface, ClientSessionAcceptedToJoinInterface, ClientSessionRejectedToJoinInterface, ServerSessionMessagesInterface, ServerUserRequestToJoinSessionToAdminInterface, SessionHandlerActionInterface } from "@/pages/public/coEditor/components/Editor.types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useWebSocket } from "./WebSocketContext";

interface MessageWebSocketContextType {
  sessionHandler: (action: SessionHandlerActionInterface, userId?: string) => void

  editMessage: (messageId: string, newContent: string) => void
  deleteMessage: (message: ChatMessageInterface) => void
  reactToMessage: (messageId: string, emoji: string) => void
  removeReaction: (messageId: string, emoji: string) => void
  messages: ChatMessageInterface[]
  sessionStatus: SessionStatusInterface['sessionStatus']
  setSessionStatus: React.Dispatch<React.SetStateAction<SessionStatusInterface['sessionStatus']>>
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageInterface[]>>
  deduplicateMessages: (messages: ChatMessageInterface[]) => ChatMessageInterface[]
  lastMessageAction: React.MutableRefObject<string | null>
  removeMessage: (messageId: string) => void
  sendChatMessage: (content: string) => void
  updateSessionMessages: (messages: ChatMessageInterface[]) => void
  userGuestRequestToJoinSession: ServerUserRequestToJoinSessionToAdminInterface | undefined
  setUserGuestRequestToJoinSession: React.Dispatch<React.SetStateAction<ServerUserRequestToJoinSessionToAdminInterface | undefined>>
}

const MessageWebSocketContext =
  createContext<MessageWebSocketContextType | null>(null)

interface MessageWebSocketProviderProps {
  children: React.ReactNode
}

export const MessageWebSocketProvider: React.FC<
  MessageWebSocketProviderProps
  > = ({ children }) => {

  const { sessionId } = useParams()
  const { sendMessage: wsSendMessage, currentUser,  subscribe } = useWebSocket()
  const [messages, setMessages] = useState<ChatMessageInterface[]>([])
  const lastMessageAction = useRef<string | null>(null);

  const [sessionStatus, setSessionStatus] = useState<SessionStatusInterface['sessionStatus']>("joined")
  const [userGuestRequestToJoinSession, setUserGuestRequestToJoinSession] = useState<ServerUserRequestToJoinSessionToAdminInterface | undefined>(undefined);

  // const [userRequestToJoinSessionQueue, setUserRequestToJoinSessionQueue] = useState<ClientUserRequestToJoinSessionInterface[]>([])

  const sendChatMessage = useCallback(
    (content: string) => {
      if (!currentUser?.userId || !sessionId || !wsSendMessage) {
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
        ...prev.filter(msg => msg.sessionId === sessionId),
        { ...messageData, state: [{state: "sending", userId: currentUser.userId!, messageMongoId: ""}] },
      ])

      try {
        // Send to websocket
        wsSendMessage(messageData)
         // Update local messages immediately

        lastMessageAction.current = WS_MESSAGE_TYPES.CLIENT_CHAT;
        return messageData
      } catch (error) {
        console.error('Failed to send message:', error);
        // Update message state to failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg.messageId === messageId && msg.sessionId === sessionId
              ? { ...msg, state: [{state: "failed", userId: currentUser.userId!, messageMongoId: ""}] }
              : msg
          )
        );
      }
    },
    [currentUser, sessionId, wsSendMessage]
  )

  const handleServerChatMessages = useCallback((message: ChatMessageInterface) => {
    lastMessageAction.current = WS_MESSAGE_TYPES.SERVER_CHAT;
    const sessionData = local("json", sessionId).get(`sessionIdentifier`);
    if(message.sessionId !== sessionId) return;

    setMessages((prevMessages) => {
      const currentSessionMessages = prevMessages.filter(msg => msg.sessionId === sessionId);
      let newMessages;
      const existingMessageIndex = currentSessionMessages.findIndex(
        (msg) => msg.messageId === message.messageId
      );

      if (existingMessageIndex !== -1) {
        newMessages = [...currentSessionMessages];
        newMessages[existingMessageIndex] = { ...message };
      } else {
        newMessages = [...currentSessionMessages, { ...message }];
      }

      local("json", sessionId).set(`sessionIdentifier`, {
        ...sessionData,
        userIdentifier: {
          ...currentUser,
          messages: newMessages,
        },
      });

      return newMessages;
    });
  }, [currentUser, sessionId]);

  const deduplicateMessages = useCallback((messages: ChatMessageInterface[]): ChatMessageInterface[] => {
    const seen = new Map()
    // reverse to keep the latest in the array and remove duplicates
    return messages.reverse().filter((msg) => {
      if (seen.has(msg.messageId)) {
        return false
      }
      seen.set(msg.messageId, true)
      return true
    }).reverse()
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


  const sessionHandler = useCallback((action: SessionHandlerActionInterface, guestId?: string) => {
    let clientMessage: ClientSessionAcceptedToJoinInterface | ClientSessionRejectedToJoinInterface | undefined;
// Add logic to add user to session if sessionStatus is requestedToJoin
    if (action === "acceptedToJoin") {
      clientMessage = {
        type: WS_MESSAGE_TYPES.CLIENT_SESSION_ACCEPTED_TO_JOIN,
        createdAt: getCurrentTimeStamp(),
        timestamp: getCurrentTimeStamp(),
        sessionId: sessionId!,
        fullName: currentUser.fullName || "",
        userId: currentUser.userId || "",
        guestId: guestId || "",
      }
    } else if (action === "rejectedToJoin") {
      clientMessage = {
        createdAt: getCurrentTimeStamp(),
        timestamp: getCurrentTimeStamp(),
        type: WS_MESSAGE_TYPES.CLIENT_SESSION_REJECTED_TO_JOIN,
        sessionId: sessionId!,
        fullName: currentUser.fullName || "",
        userId: currentUser.userId || "",
        guestId: guestId || "",
      }

      // userGuestRequestToJoinSession


    } else {
      clientMessage = undefined;
    }

    setUserGuestRequestToJoinSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        type: "server_session_user_request_to_join_session_to_admin",
        guests: prev.guests.filter((guest) => guest.userId !== guestId)
      }
    })

    setSessionStatus("joined")

    if (clientMessage) {
      wsSendMessage(clientMessage)
    }




  }, [currentUser, sessionId, wsSendMessage])


  const deleteMessage = useCallback(
    (message: ChatMessageInterface) => {
      if (!currentUser.userId || !sessionId) return
      lastMessageAction.current = WS_MESSAGE_TYPES.CLIENT_CHAT_DELETE;

      setMessages(prevMessages => {
        prevMessages = prevMessages.filter(msg => msg.sessionId === sessionId)
        return prevMessages.map(msg =>
          msg.messageId === message.messageId
            ? { ...msg, content: "Message has been deleted", state: [{state: "deleted", userId: currentUser.userId!, messageMongoId: msg.messageId}] }
            : msg
        )
      });

      wsSendMessage({
        ...message,
        _id: message._id,
        type: WS_MESSAGE_TYPES.CLIENT_CHAT_DELETE,
        messageId: message.messageId,
        userId: currentUser.userId,
        sessionId,
        content: '',
        createdAt: getCurrentTimeStamp(),
        fullName: currentUser?.fullName || '',
        state: [{state: "deleted", userId: currentUser.userId!, messageMongoId: message._id!}],
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
      state: [{state: "removed", userId: currentUser.userId, messageMongoId: ""}],
    });

  }, [currentUser, sessionId, wsSendMessage])




  const handleSessionReloadMessages = useCallback((session: ServerSessionMessagesInterface) => {
    lastMessageAction.current = WS_MESSAGE_TYPES.SERVER_SESSION_MESSAGES;

    if (!session.messages) {
      setMessages([]);
      return;
    }

    setMessages(() => {
      const currentSessionMessages = session.messages.filter(msg => msg.sessionId === sessionId);
      const allMessages = [...currentSessionMessages] as ChatMessageInterface[];
      const uniqueMessages = deduplicateMessages(allMessages);

      const sessionData = local("json", sessionId).get(`sessionIdentifier`);
      local("json", sessionId).set(`sessionIdentifier`, {
        ...sessionData,
        userIdentifier: {
          ...currentUser,
          messages: uniqueMessages,
        },
      });

      return uniqueMessages;
    });
  }, [currentUser, sessionId, deduplicateMessages]);


  const updateSessionMessages = useCallback((messages: ChatMessageInterface[]) => {

    if (messages.some(message => message.sessionId !== sessionId)) return;

    setMessages(prevMessages => {
      prevMessages = prevMessages.filter(message => message.sessionId === sessionId)
      // update props of previous messages
      const updatedMessages = prevMessages.map((msg) => {
        const message = messages.find(m => m.messageId === msg.messageId)
        return {
          ...msg,
          content: message?.content,
          state: message?.state
        }
      })

      const allMessages = [...updatedMessages] as ChatMessageInterface[]
      const uniqueMessages = deduplicateMessages(allMessages)


      return uniqueMessages
    })
  }, [setMessages, deduplicateMessages])

  const handleServerChatDelete = useCallback(
    (message: ChatMessageInterface) => {
      lastMessageAction.current = WS_MESSAGE_TYPES.SERVER_CHAT_DELETE;
      if(message.sessionId !== sessionId) return;

      setMessages(prevMessages =>
        prevMessages.filter(msg => msg.sessionId === sessionId).map(msg =>
          msg.messageId === message.messageId
              ? message
            : msg
        )
      );
    },
    [setMessages]
  )

  const handleJoinSessionByAdmin = useCallback((session: ServerUserRequestToJoinSessionToAdminInterface) => {

    setUserGuestRequestToJoinSession(session);

    const request = "requestedToJoin"
    setSessionStatus(request);

  }, []);

  const handleJoinSessionByGuest = useCallback(() => {
    const request = "requestReceivedToJoin"
    setSessionStatus(request)
  }, [])





  useEffect(() => {
    const unsubscribeServerChatDelete = subscribe(
      WS_MESSAGE_TYPES.SERVER_CHAT_DELETE,
      handleServerChatDelete
    );


    const unsubscribeSessionReload = subscribe(
      WS_MESSAGE_TYPES.SERVER_SESSION_MESSAGES,
      handleSessionReloadMessages
    )

    const unsubscribeChat = subscribe(
      WS_MESSAGE_TYPES.SERVER_CHAT,
      handleServerChatMessages
    )

    const unsubscribeJoinSessionToAdmin = subscribe(
      WS_MESSAGE_TYPES.SERVER_USER_REQUEST_TO_JOIN_SESSION_TO_ADMIN,
      handleJoinSessionByAdmin
    )

    const unsubscribeJoinSessionToGuest = subscribe(
      WS_MESSAGE_TYPES.SERVER_USER_REQUEST_TO_JOIN_SESSION_TO_GUEST,
      handleJoinSessionByGuest
    )

    return () => {
      unsubscribeServerChatDelete()
      unsubscribeSessionReload()
      unsubscribeChat()
      unsubscribeJoinSessionToAdmin()
      unsubscribeJoinSessionToGuest()
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
      removeMessage,
      updateSessionMessages,
      sessionStatus,
      setSessionStatus,
      sessionHandler,
      userGuestRequestToJoinSession,
      setUserGuestRequestToJoinSession
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
      removeMessage,
      updateSessionMessages,
      sessionStatus,
      setSessionStatus,
      sessionHandler,
      userGuestRequestToJoinSession,
      setUserGuestRequestToJoinSession
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
