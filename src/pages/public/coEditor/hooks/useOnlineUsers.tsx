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
  const { status, subscribe } = useWebSocket();

  const STORAGE_KEY = sessionId
  const [userHistory, setUserHistory] = useState<OnlineUserInterface[]>(() => {
    const stored = local("json", STORAGE_KEY).get("online_users")
    return stored ? stored : []
  })

  const getActiveUsers = useCallback(
    (userHistory: OnlineUserInterface[]) => {
      const now = new Date()
      const lastActive = subMinutes(now, minutes)
      const activeUsers = userHistory.filter((user) => {
        const lastSeenAtDate = parseISO(user.lastSeenAt as string)
        return isAfter(lastSeenAtDate, lastActive)
      })
      return activeUsers
    },
    [minutes]
  )

  const [activeUsers, setActiveUsers] = useState<OnlineUserInterface[]>([])

  useEffect(() => {
    if (status === "connected") {
      const activeUsers = getActiveUsers(userHistory)
      setActiveUsers(activeUsers)
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

  const handleUserJoined = useCallback((data: ServerUserJoinedSessionInterface) => {
    const newUsers: OnlineUserInterface[] = data.guests
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
  }, [])

  const handleUserLeft = useCallback((data: ServerUserDisconnectedInterface) => {

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
  }, [])

  useEffect(() => {
    // if (!sessionId || status !== 'connected') {
    //   return;
    // }


    const unsubscribeUserJoined = subscribe(
      WS_MESSAGE_TYPES.SERVER_USER_JOINED_SESSION,
      (data: ServerUserJoinedSessionInterface) => {
        handleUserJoined(data);
      }
    );

    const unsubscribeUserLeft = subscribe(
      WS_MESSAGE_TYPES.SERVER_USER_DISCONNECTED,
      (data: ServerUserDisconnectedInterface) => {
        handleUserLeft(data);
      }
    );

    return () => {
      unsubscribeUserJoined();
      unsubscribeUserLeft();
    };
  }, [sessionId, status, subscribe, handleUserJoined, handleUserLeft]);

  // if (!sessionId) {
  //   return {
  //     activeUsers: [],
  //     users: [],
  //   }
  // }

  return {
    activeUsers,
    users: userHistory,
  }
}
