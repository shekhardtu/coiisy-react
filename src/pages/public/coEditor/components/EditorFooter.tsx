import { useWebSocket } from "@/contexts/WebSocketContext";
import { BadgeAlert, BadgeCheck, Trash2 } from "lucide-react";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useEditorContext from "../hooks/useEditor.contexthook";
import SessionStartedTime from "./SessionStartedTime";
interface EditorFooterProps {
  cursorPosition: { line: number; column: number }
  isWebSocketConnected?: boolean
  className?: string
}

  const EditorFooter: React.FC<EditorFooterProps> = ({className}) => {
  const {  sessionId } = useEditorContext();

  const navigate = useNavigate()
  const { status, disconnect, tryConnect } = useWebSocket()
  const [isWebSocketConnected, SetIsWebSocketConnected] = React.useState(
    status === "connected"
  ) // Add state for websocket status

  React.useEffect(() => {
    SetIsWebSocketConnected(status === "connected")
  }, [status])

  const handleClearSession = useCallback(() => {

    if (status === "connected") {
      disconnect();
    }


    navigate(`/clear/${sessionId}`);
  }, [status, disconnect, navigate, sessionId]);

  const handleConnectAgain = useCallback(() => {
    if (status === "connected") {
      disconnect()
    } else {
      tryConnect()
    }

    SetIsWebSocketConnected(status === "connected")
  }, [status, disconnect])

  return (
    <footer className={`flex items-center bg-background border-t border-border text-xs justify-between h-8 ${className}`}>
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center cursor-pointer"
            onClick={handleConnectAgain}
          >
            {isWebSocketConnected ? (
              <BadgeCheck className="h-4 w-4 text-green-600" />
            ) : (
              <BadgeAlert className="h-4 w-4 text-red-600" />
            )}
            <span className="ml-1 hidden sm:inline">
              {isWebSocketConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        <div className="hidden sm:block text-muted-foreground truncate">
          {sessionId}
        </div>

        <div className="flex items-center gap-2">
          <SessionStartedTime sessionId={sessionId} />
          <button
            className="text-red-600 flex items-center gap-1"
            onClick={handleClearSession}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clear Session</span>
          </button>
        </div>
      </div>
    </footer>
  )
}

export default EditorFooter
