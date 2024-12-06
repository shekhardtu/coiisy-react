import { useMessageWebSocket } from "@/contexts/MessageWebSocket.context";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CurrentUserInterface } from "../../coEditor/components/Editor.types";
import { SessionStatusInterface } from "./chat.types";

interface ChatInputInfoBarProps {
  tryConnect: () => void
  status: string
  sessionStatus: SessionStatusInterface["sessionStatus"]
}
const ChatInputInfoBar = ({
  tryConnect,
  status,
  sessionStatus,
}: ChatInputInfoBarProps) => {
  const { sessionHandler, userGuestRequestToJoinSession } =
    useMessageWebSocket()
  const [actionStatus, setActionStatus] = useState<{userId: string, action: 'accepted' | 'rejected'} | null>(null);

  return (
    <>
      <div className="p-0 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center justify-center top-0 left-0 right-0 -translate-y-full">
        {/* // Connection lost  */}
        {status === "disconnected" && (
          <div className="flex items-center gap-2 p-2">
            <p className="text-xs text-center text-yellow-600 mr-2">
              Connection lost. Messages won't be delivered until reconnected.
            </p>
            <button
              onClick={tryConnect}
              className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Reconnect
            </button>
          </div>
        )}

        {/* Guest request to join session  */}

        {status === "connected" && sessionStatus === "requestedToJoin" && (
          <div className="flex items-center gap-2 p-2">
            {(userGuestRequestToJoinSession?.guests?.length ?? 0) > 0 &&
              userGuestRequestToJoinSession?.guests?.map(
                (guest: CurrentUserInterface) => {
                  return (
                    <>
                      <p className="text-xs text-center text-yellow-600 mr-2">
                        <span className="font-bold">{guest.fullName}</span> requested to join the session
                      </p>

                      <div
                        className="flex items-center gap-2"
                        key={guest.userId}
                      >
                        {actionStatus?.userId === guest.userId ? (
                          <div className={cn(
                            "text-xs px-4 py-1 rounded animate-fadeOut",
                            actionStatus!.action === 'accepted'
                              ? "bg-green-500/10 text-green-600"
                              : "bg-red-500/10 text-red-600"
                          )}>
                            {actionStatus!.action === 'accepted' ? 'Accepted' : 'Rejected'}
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setActionStatus({ userId: guest.userId!, action: 'accepted' });
                                sessionHandler("acceptedToJoin", guest.userId);
                                setTimeout(() => setActionStatus(null), 2000);
                              }}
                              className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                            >
                              Allow
                            </button>
                            <button
                              onClick={() => {
                                setActionStatus({ userId: guest.userId!, action: 'rejected' });
                                sessionHandler("rejectedToJoin", guest.userId);
                                setTimeout(() => setActionStatus(null), 2000);
                              }}
                              className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                            >
                              Deny
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )
                }
              )}
          </div>
        )}
      </div>
    </>
  )
}

export default ChatInputInfoBar
