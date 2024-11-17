import EditorErrorBoundary from "@/components/editor/EditorErrorBoundary";
import { getCurrentTimeStamp, local } from "@/lib/utils";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

import { MessageWebSocketProvider } from "@/contexts/MessageWebSocket.context";
import { ViewportProvider } from "@/contexts/Viewport.context";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { CurrentUserInterface } from "../coEditor/components/Editor.types";
import { JoinSessionModal } from "../coEditor/components/JoinSessionModal";
import { EditorProvider } from "../coEditor/contexts/Editor.context";
import useEditorContext from "../coEditor/hooks/useEditor.contexthook";


const ChatLayoutContent: React.FC<{ existingSessionId: string | undefined }> = ({ existingSessionId }) => {

  const navigate = useNavigate();

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const { tryConnect } = useWebSocket();

  const {
    theme,
    sessionData,
    setSessionData,

  } = useEditorContext();

  useEffect(() => {
    if (existingSessionId) {
      const savedSessionData = local("json", existingSessionId).get(`sessionIdentifier`);


      if (savedSessionData?.guestIdentifier) {
        setSessionData(savedSessionData);
        setIsJoinModalOpen(false);
      } else {
        setIsJoinModalOpen(true);
      }
    }
  }, [existingSessionId, setSessionData]);



  const handleJoinSession = useCallback((fullName: string) => {
    if (!fullName.trim()) return;
    const sessionId = existingSessionId || uuidv4();

    const guestIdentifier: CurrentUserInterface = {
      fullName: fullName.trim(),
      userId: uuidv4(),
      createdAt: getCurrentTimeStamp(),
      messages: [],
      isTyping: false,
      sessionId
    };


    const newSessionData = {
      guestIdentifier,
      sessionId,
      createdAt: getCurrentTimeStamp()
    };


    if (!existingSessionId) {
      navigate(`/${sessionId}`);
    }


    setSessionData(newSessionData);
    local("json", sessionId).set(`sessionIdentifier`, newSessionData);
    setIsJoinModalOpen(false);
    tryConnect();

  }, [existingSessionId, navigate, setSessionData]);

  const sessionStats =  {
    onlineCount: 0,
    totalCount: 0,
  };

  return (
    <div className="flex flex-col h-full relative overflow-x-hidden overflow-y-hidden">
      {!sessionData?.sessionId ? (
        <div className="absolute top-0 left-0 w-full z-50">
          <JoinSessionModal
            isOpen={isJoinModalOpen}
            onJoin={handleJoinSession}
            sessionName={existingSessionId}
            sessionUrl={window.location.href}
            onlineCount={sessionStats?.onlineCount || 0}
            totalCount={sessionStats?.totalCount || 0}
          />
        </div>
      ) : (
        <ViewportProvider>
          <MessageWebSocketProvider>
            <EditorErrorBoundary>
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse">Loading editor...</div>
                </div>
              }>
                <Outlet context={{ theme, sessionId: sessionData.sessionId }} />
              </Suspense>
            </EditorErrorBoundary>
          </MessageWebSocketProvider>
        </ViewportProvider>
      )}
    </div>
  );
};

const ChatLayout: React.FC = () => {

  const { sessionId } = useParams();


  return (
    <EditorProvider>
      <ChatLayoutContent existingSessionId={sessionId} />
    </EditorProvider>
  );
};

export default ChatLayout;


