import { useWebSocket } from "@/contexts/WebSocketContext";
import { local } from "@/lib/utils";
import { WS_MESSAGE_TYPES } from "@/lib/webSocket.config";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  OnlineUserInterface,
  ServerUserDisconnectedInterface,
  ServerUserJoinedSessionInterface,
} from "../components/Editor.types";


export const useOnlineUsers = () => {
  const { status, subscribe } = useWebSocket()
  const { sessionId } = useParams()
  if (!sessionId) {
    throw new Error('sessionId is required for useOnlineUsers hook')
  }

  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false)
  const STORAGE_KEY = sessionId



  const [userHistory, setUserHistory] = useState<OnlineUserInterface[]>([])


  const [activeUsers, setActiveUsers] = useState<OnlineUserInterface[]>([])
  const [autoJoin, setAutoJoin] = useState<boolean>(false)



  // Update active users when status changes
  useEffect(() => {


    if (status === "connected" && sessionId) {
      const onlineUsers = userHistory.filter(user =>
        user.isOnline && user.sessionId === sessionId
      )

      setActiveUsers(onlineUsers)
    } else if (status === "disconnected") {
      setActiveUsers([])
    }
  }, [status, sessionId, userHistory])

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

      setUserHistory(newUsers)
      setActiveUsers(newUsers.filter(user => user.isOnline))
    },
    [sessionId]
  )

  const handleUserLeft = useCallback(
    (data: ServerUserDisconnectedInterface) => {
      setUserHistory(prevUsers => {
        const updatedUsers = prevUsers
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
          .sort((a) => (a.isOnline ? -1 : 1));

        setActiveUsers(updatedUsers.filter(user => user.isOnline && user.sessionId === sessionId));
        return updatedUsers;
      });
    },
    [sessionId]
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

    // Clean up subscriptions when sessionId changes
    return () => {
      unsubscribeUserJoined()
      unsubscribeUserLeft()
    }
  }, [sessionId, subscribe, handleUserJoined, handleUserLeft])




  return {
    activeUsers: activeUsers.filter((item, index, arr) => arr.findIndex(user => user.userId === item.userId) === index),
    users: userHistory,
    isUserAdmin,
    autoJoin,
  }
}
