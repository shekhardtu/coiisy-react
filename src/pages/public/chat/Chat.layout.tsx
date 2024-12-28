import EditorErrorBoundary from "@/components/editor/EditorErrorBoundary";
import { getCurrentTimeStamp, local } from "@/lib/utils";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MessageWebSocketProvider } from "@/contexts/MessageWebSocket.context";
import { ViewportProvider } from "@/contexts/Viewport.context";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { CurrentUserInterface } from "../coEditor/components/Editor.types";
import { JoinSessionModal } from "../coEditor/components/JoinSessionModal";
import { EditorProvider } from "../coEditor/contexts/Editor.context";
import useEditorContext from "../coEditor/hooks/useEditor.contexthook";
import { AppSidebar } from "./components/ChatSidebar";


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
    setIsJoinModalOpen(false);
    if (existingSessionId) {
      const savedSessionData = local("json", existingSessionId).get(`sessionIdentifier`);


      if (savedSessionData?.userIdentifier) {
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

    const userIdentifier: CurrentUserInterface = {
      fullName: fullName.trim(),
      userId: uuidv4(),
      createdAt: getCurrentTimeStamp(),
      messages: [],
      isTyping: false,
      sessionId
    };


    const newSessionData = {
      userIdentifier,
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



  const handleNewChannel = useCallback((channelId: string) => {
    setSessionData(null);
    navigate(`/${channelId}`);
    setIsJoinModalOpen(true);
  }, [setSessionData, navigate]);

  return (
    <div className="flex flex-col h-full relative overflow-x-hidden overflow-y-hidden">
      {(!sessionData?.sessionId && !sessionData?.userIdentifier) || isJoinModalOpen ? (
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
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse">Loading editor...</div>
          </div>
        }>
            <EditorErrorBoundary>
              <SidebarProvider className="flex flex-1 h-full w-full flex-row">
                <AppSidebar
                  sessionId={sessionData.sessionId!}
                  onNewChannel={handleNewChannel}
                />
                <Outlet context={{ theme, sessionId: sessionData.sessionId, sidebarTrigger: <SidebarTrigger  /> }} />
              </SidebarProvider>
            </EditorErrorBoundary>
        </Suspense>
      )}
    </div>
  );
};

const ChatLayout: React.FC = () => {

  const { sessionId } = useParams();


  return (
    <EditorProvider>
        <ViewportProvider>
          <MessageWebSocketProvider>
            <ChatLayoutContent existingSessionId={sessionId} />
          </MessageWebSocketProvider>
        </ViewportProvider>

    </EditorProvider>
  );
};

export default ChatLayout;


