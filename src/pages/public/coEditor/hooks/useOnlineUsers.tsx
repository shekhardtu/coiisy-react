import { useWebSocket } from "@/contexts/WebSocketContext";
import { local } from "@/lib/utils";
import { WS_MESSAGE_TYPES, wsConfig } from "@/lib/webSocket.config";
import { isAfter, parseISO, subMinutes } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import {
  OnlineUserInterface,
  ServerUserDisconnectedInterface,
  ServerUserJoinedSessionInterface,
} from "../components/Editor.types";
interface UseOnlineUsersProps {
  minutes?: number
  sessionId: string
}

export const useOnlineUsers = ({
  minutes = wsConfig.onlineTimeoutInMinutes,
  sessionId,
}: UseOnlineUsersProps) => {
  const { status, subscribe } = useWebSocket()

  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false)

  const STORAGE_KEY = sessionId
  const getStoredUsers = () => {
    const storedSession = local("json", STORAGE_KEY).get("sessionIdentifier")
    return storedSession?.onlineUsers?.filter((user: OnlineUserInterface) =>
      user.sessionId === sessionId
    ) || []
  }

  const [userHistory, setUserHistory] = useState<OnlineUserInterface[]>(getStoredUsers)

  const saveUsersToStorage = useCallback((users: OnlineUserInterface[]) => {
    const storedSession = local("json", STORAGE_KEY).get("sessionIdentifier")
    const otherSessionUsers = (storedSession?.onlineUsers || []).filter(
      (user: OnlineUserInterface) => user.sessionId !== sessionId
    )

    local("json", STORAGE_KEY).set("sessionIdentifier", {
      ...storedSession,
      onlineUsers: [...otherSessionUsers, ...users]
    })
  }, [STORAGE_KEY, sessionId])

  const getActiveUsers = useCallback(
    (userHistory: OnlineUserInterface[]) => {
      const now = new Date()
      const lastActive = subMinutes(now, minutes)

      const activeUsers = userHistory?.filter((user) => {
        const lastSeenAtDate = parseISO(user.lastSeenAt as string)
        return isAfter(lastSeenAtDate, lastActive)
      })
      return activeUsers
    },
    [minutes]
  )

  const [activeUsers, setActiveUsers] = useState<OnlineUserInterface[]>([])
  const [autoJoin, setAutoJoin] = useState<boolean>(false)



  useEffect(() => {

    if (status === "connected" && userHistory.length > 0) {
      const activeUsers = getActiveUsers(userHistory)
      setActiveUsers(activeUsers)
    } else if (status === "disconnected") {
      setActiveUsers([])
    }
  }, [getActiveUsers, status, userHistory])

  useEffect(() => {
    if (!sessionId) return

    const currentSessionUsers = userHistory.map(user => ({
      ...user,
      sessionId
    }))

    saveUsersToStorage(currentSessionUsers)
    setActiveUsers(getActiveUsers(currentSessionUsers))
  }, [userHistory, sessionId, getActiveUsers, saveUsersToStorage])

  useEffect(() => {
    // Check admin status whenever userHistory changes
    const existingUserIdentifier = local("json", STORAGE_KEY).get("sessionIdentifier");
    if (existingUserIdentifier) {
      const currentUser = userHistory.find(
        (user) => user.userId === existingUserIdentifier?.userIdentifier?.userId
      );
      setIsUserAdmin(!!currentUser?.isAdmin);
    }
  }, [userHistory, STORAGE_KEY]);

  const handleUserJoined = useCallback(
    (data: ServerUserJoinedSessionInterface) => {
      if (data.autoJoin) {
        setAutoJoin(true)
      }

      if(data.sessionId !== sessionId){
        return
      }

      const newUsers: OnlineUserInterface[] = data.guests
        .filter(user => user.sessionId === sessionId)
        .map((user) => ({
          ...user,
          initials: user.fullName?.slice(0, 2),
          fullName: user.fullName,
          isOnline: user.isOnline,
          isAdmin: user.isAdmin,
          userId: user.userId,
          isShow: true,
          connectedAt: user.connectedAt,
          lastSeenAt: user.lastSeenAt,
        }))
        .sort((a) => (a.isOnline ? -1 : 1))



      setUserHistory((prev) => {
        const merged = [...prev]
        newUsers.forEach((newUser) => {
          const existingIndex = merged.findIndex(
            (u) => u.userId === newUser.userId && u.sessionId === sessionId
          )
          if (existingIndex >= 0) {
            merged[existingIndex] = {
              ...merged[existingIndex],
              isOnline: newUser.isOnline,
              connectedAt: newUser.connectedAt,
              lastSeenAt: newUser.lastSeenAt,
              isAdmin: newUser.isAdmin,
              sessionId
            }
          } else {
            merged.push(newUser)
          }
        })
        return merged.sort((a) => (a.isOnline ? -1 : 1))
      })
    },
    [sessionId]
  )

  const handleUserLeft = useCallback(
    (data: ServerUserDisconnectedInterface) => {

      setUserHistory((prevUsers) =>
        prevUsers
          .map((u) =>
            u.userId === data.userId
              ? {
                  ...u,
                  lastSeenAt: data.lastSeenAt,
                  isOnline: false,
                  isShow: true,
                  sessionId
                }
              : u
          )
          .sort((a) => (a.isOnline ? -1 : 1))
      )
    },
    []
  )

  useEffect(() => {

    const unsubscribeUserJoined = subscribe(
      WS_MESSAGE_TYPES.SERVER_USER_JOINED_SESSION,
      (data: ServerUserJoinedSessionInterface) => {
        handleUserJoined(data)
      }
    )

    const unsubscribeUserLeft = subscribe(
      WS_MESSAGE_TYPES.SERVER_USER_DISCONNECTED,
      (data: ServerUserDisconnectedInterface) => {
        handleUserLeft(data)
      }
    )

    return () => {
      unsubscribeUserJoined()
      unsubscribeUserLeft()
    }
  }, [sessionId, status, subscribe, handleUserJoined, handleUserLeft])



  return {
    activeUsers,
    users: userHistory,
    isUserAdmin,
    autoJoin,
  }
}
