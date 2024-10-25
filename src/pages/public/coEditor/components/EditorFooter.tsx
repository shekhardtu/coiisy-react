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
  }, [status, disconnect, tryConnect])

  return (
    <footer className={`flex items-center bg-background border-t border-border text-xs justify-between h-8 ${className}`}>
      <div className="flex items-center flex-1 justify-between h-full overflow-hidden">
        <div className="flex items-center h-full">
          <div className="h-full w-36 flex items-center justify-center ">
            <div
              className="flex items-center cursor-pointer"
              onClick={handleConnectAgain}
            >
              <span className="px-2 inline-flex items-center gap-2">
                {isWebSocketConnected == true ? (
                  <BadgeCheck className="h-full text-green-600" size={18} />
                ) : (
                  <BadgeAlert className="h-full text-red-600" size={18} />
                )}
                {isWebSocketConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <div className="h-full w-px bg-border mx-2"></div>
          </div>
        </div>

        <div className="flex items-center justify-center h-full">
          {/* <div className="text-muted-foreground px-2 p-2">
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </div> */}
          {/* <div className="h-full w-px bg-border mx-2"></div> */}
          {/* <SessionDuration /> */}

          <div className="text-muted-foreground px-2 p-2 text-xs">
          {sessionId}
          </div>

        </div>
      </div>
      <div className="flex items-center max-w-80 h-full justify-between overflow-hidden">
        <SessionStartedTime sessionId={sessionId} />
        <div
          className="text-muted-foreground px-2 p-2 cursor-pointer flex items-center justify-center hover:text-red-600"
          onClick={handleClearSession}
        >
          <Trash2 className="h-full text-red-600 mr-1" size={16} />
          Clear Session
        </div>
      </div>
    </footer>
  )
}

export default EditorFooter
