import CopyWithInput from "@/components/copy/withInput";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  useWebSocket
} from "@/contexts/WebSocketContext";
import { cn, getUnitsToMinutes, local } from "@/lib/utils";
import { WS_MESSAGE_TYPES } from "@/lib/webSocket.config";
import { ChevronDown, ChevronUp, Share2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { OnlineUserInterface, ServerUserDisconnectedInterface, ServerUserJoinedSessionInterface } from "./Editor.types";
import ThemeSelector from "./ThemeSelector";
import UserAvatars from "./UsersAvatar";

interface EditorHeaderProps {
  onThemeChange: (theme: "light" | "dark") => void
  theme: "light" | "dark"
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  onThemeChange,
  theme,
}) => {
  const [users, setUsers] = useState<OnlineUserInterface[]>([])
  const { subscribe, status } = useWebSocket()
  const url = window.location.href
  const minutes = 30;
  const [isFocusMode, setIsFocusMode] = useState<boolean>(() => {

    const saved = local('json', 'key').get('editorFocusMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    local('json', 'key').set("editorFocusMode", isFocusMode);
  }, [isFocusMode]);

  const toggleFocusMode = () => {
    setIsFocusMode(prev => !prev);
  };

  useEffect(() => {
    if (status === "disconnected") {
      setUsers([])
    }
  }, [status])

  useEffect(() => {
    const unsubscribeUserJoined = subscribe(
      WS_MESSAGE_TYPES.SERVER_USER_JOINED_SESSION,
      (data: ServerUserJoinedSessionInterface) => {
        const users: OnlineUserInterface[] = data.participants
          .map((user) => {
            return {
              initials: user.fullName?.slice(0, 2),
              fullName: user.fullName,
              isOnline: user.isOnline,
              userId: user.userId,
              isShow: user.isOnline || (new Date().getTime() - new Date(user.lastSeenAt).getTime() <= getUnitsToMinutes(minutes)),
              connectedAt: user.connectedAt,
              lastSeenAt: user.lastSeenAt,
            }
          })
          .sort((a) => (a.isOnline ? -1 : 1))


        setUsers((prevUsers) => {
          const filteredUsers = prevUsers.filter(
            (u) => !users.some((newUser) => newUser.userId === u.userId)
          )
          return [...filteredUsers, ...users]
        })
      }
    )



    const unsubscribeUserLeft = subscribe(
      WS_MESSAGE_TYPES.SERVER_USER_DISCONNECTED,
      (data: ServerUserDisconnectedInterface) => {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.userId == data.userId
              ? {
                  ...u,
                  lastSeenAt: data.lastSeenAt,
                  isOnline: false,
                }
              : u
          )
        )
      }
    )

    return () => {
      unsubscribeUserJoined()
      unsubscribeUserLeft()

    }
  }, [])

  return (
    <div className="relative">
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          isFocusMode ? "-translate-y-full" : "translate-y-0"
        )}
      >
        <div
          className={cn(
            "container flex h-14 items-center justify-between px-4 transition-all duration-300",
            isFocusMode && "opacity-0"
          )}
        >
          <div className="flex items-center gap-2 flex-1 justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/heela.svg" alt="heela" className="h-6 w-6" />
              <span className="hidden sm:inline-block font-bold">Coiisy</span>
            </Link>

            <div className="flex items-center gap-2">
              {users.length > 0 && <UserAvatars users={users} />}
            </div>
          </div>

          <Separator orientation="vertical" className="h-6 mx-6 hidden sm:block" />

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-8 h-8 sm:w-auto">
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline-block ml-2">Share</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[300px]"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <div className="p-2">
                  <CopyWithInput url={url} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={toggleFocusMode}
              className="w-8 h-8 flex items-center justify-center"
            >
              {isFocusMode ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>

            <ThemeSelector onThemeChange={onThemeChange} theme={theme} />
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out border-b border-border/40",
          isFocusMode ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="container flex h-8 max-w-screen-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2 justify-between w-full flex-1">
            <div className="flex items-center gap-3">
              <img src="/heela.svg" alt="heela" className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              {users.length > 0 && <UserAvatars users={users} size="sm" />}
            </div>
          </div>
          <Separator orientation="vertical" className="h-2/3 mx-6" />
          <div className="flex items-center gap-3 min-w-80 justify-between">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <Share2 className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[300px]"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="p-2">
                    <CopyWithInput url={url} />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
              <button
                onClick={toggleFocusMode}
                className={cn(
                  "z-50 rounded-full h-6 w-6 flex items-center justify-center transition-all duration-200",
                  "hover:bg-muted hover:shadow-md",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  isFocusMode
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background border shadow-sm"
                )}
                aria-label={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
              >
                {isFocusMode ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </button>
              </div>
              <ThemeSelector
                onThemeChange={onThemeChange}
                theme={theme}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorHeader
