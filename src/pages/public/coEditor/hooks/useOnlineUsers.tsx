import { useWebSocket } from "@/contexts/WebSocketContext";
import { WS_MESSAGE_TYPES } from "@/lib/webSocket.config";
import { useEffect, useState } from "react";
import { OnlineUserInterface, ServerUserDisconnectedInterface, ServerUserJoinedSessionInterface } from "../components/Editor.types";

export const useOnlineUsers = (minutes: number = 30) => {
  const [userHistory, setUserHistory] = useState<OnlineUserInterface[]>([]);

  const { subscribe } = useWebSocket();



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
          .sort((a) => (a.isOnline ? -1 : 1));

        setUserHistory(prev => {
          const merged = [...prev];
          newUsers.forEach(newUser => {
            const existingIndex = merged.findIndex(u => u.userId === newUser.userId);
            if (existingIndex >= 0) {
              merged[existingIndex] = {
                ...merged[existingIndex],
                isOnline: newUser.isOnline,
                connectedAt: newUser.connectedAt,
                lastSeenAt: newUser.lastSeenAt,
              };
            } else {
              merged.push(newUser);
            }
          });
          return merged.sort((a) => (a.isOnline ? -1 : 1));
        });
      }
    );

    const unsubscribeUserLeft = subscribe(
      WS_MESSAGE_TYPES.SERVER_USER_DISCONNECTED,
      (data: ServerUserDisconnectedInterface) => {
        setUserHistory((prevUsers) =>
          prevUsers.map((u) =>
            u.userId === data.userId
              ? {
                  ...u,
                  lastSeenAt: data.lastSeenAt,
                  isOnline: false,
                  isShow: true,
                }
              : u
          ).sort((a) => (a.isOnline ? -1 : 1))
        );
      }
    );

    return () => {
      unsubscribeUserJoined();
      unsubscribeUserLeft();
    };
  }, [minutes, subscribe]);

  return {
    users: userHistory,
  };
};