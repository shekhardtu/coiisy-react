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
  const { status } = useWebSocket()
  // const { updateSessionMessages } = useMessageWebSocket()

  const STORAGE_KEY = sessionId
  const [userHistory, setUserHistory] = useState<OnlineUserInterface[]>(() => {
    const stored = local("json", STORAGE_KEY).get("online_users")
    return stored ? stored : []
  })

  const getActiveUsers = useCallback(
    (userHistory: OnlineUserInterface[]) => {
      const now = new Date()
      const lastActive = subMinutes(now, minutes)
      return userHistory.filter((user) => {
        const lastSeenAtDate = parseISO(user.lastSeenAt as string)
        return isAfter(lastSeenAtDate, lastActive)
      })
    },
    [minutes]
  )

  const [activeUsers, setActiveUsers] = useState<OnlineUserInterface[]>([])

  useEffect(() => {
    if (status === "connected") {
      setActiveUsers(getActiveUsers(userHistory))
    } else if (status === "disconnected") {
      setActiveUsers([])
    }
  }, [getActiveUsers, status, userHistory])

  useEffect(() => {
    if (!sessionId) {
      return
    }
    local("json", STORAGE_KEY).set("online_users", userHistory)
    setActiveUsers(getActiveUsers(userHistory))
  }, [userHistory, sessionId, STORAGE_KEY, getActiveUsers])

  const { subscribe } = useWebSocket()

  useEffect(() => {
    const unsubscribeUserJoined = subscribe(
      WS_MESSAGE_TYPES.SERVER_USER_JOINED_SESSION,
      (data: ServerUserJoinedSessionInterface) => {
        const newUsers: OnlineUserInterface[] = data.participants
          .map((user) => ({
            initials: user.fullName?.slice(0, 2),
            fullName: user.fullName,
            isOnline: user.isOnline,
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
              (u) => u.userId === newUser.userId
            )
            if (existingIndex >= 0) {
              merged[existingIndex] = {
                ...merged[existingIndex],
                isOnline: newUser.isOnline,
                connectedAt: newUser.connectedAt,
                lastSeenAt: newUser.lastSeenAt,
              }
            } else {
              merged.push(newUser)
            }
          })
          return merged.sort((a) => (a.isOnline ? -1 : 1))
        })

        // updateSessionMessages(data.messages)
      }
    )

    const unsubscribeUserLeft = subscribe(
      WS_MESSAGE_TYPES.SERVER_USER_DISCONNECTED,
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
                  }
                : u
            )
            .sort((a) => (a.isOnline ? -1 : 1))
        )
      }
    )

    return () => {
      unsubscribeUserJoined()
      unsubscribeUserLeft()
    }
  }, [minutes, subscribe])

  if (!sessionId) {
    return {
      activeUsers: [],
      users: [],
    }
  }

  return {
    activeUsers,
    users: userHistory,
  }
}
