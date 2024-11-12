import EditorErrorBoundary from "@/components/editor/EditorErrorBoundary";
import { getCurrentTimeStamp } from "@/lib/utils";
import React, { Suspense, useContext, useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

import { MessageWebSocketProvider } from "@/contexts/MessageWebSocket.context";
import { ViewportProvider } from "@/contexts/Viewport.context";
import { EditorContext, EditorProvider } from "../coEditor/contexts/Editor.context";
import useEditorContext from "../coEditor/hooks/useEditor.contexthook";
const EditorLayoutContent: React.FC<{ existingSessionId: string | undefined }> = ({ existingSessionId }) => {
  const editorContext = useContext(EditorContext);

  if (!editorContext) {
    throw new Error('EditorLayoutContent must be used within EditorProvider');
  }



  const {
    theme,
    sessionData,
    setSessionData,
    initializeSession

  } = useEditorContext();

  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState<string | undefined>(() => {
    return uuidv4();
  }
  );


  useEffect(() => {
    if (!existingSessionId) {
      navigate(`/${sessionId}`);
      setSessionId(sessionId);
      setSessionData({
        sessionId: sessionId,
        createdAt: getCurrentTimeStamp(),
      });
      initializeSession({ sessionId: sessionId });

    } else {
      setSessionId(existingSessionId);
      initializeSession({ sessionId: existingSessionId });
    }

  }, [existingSessionId, initializeSession, navigate, sessionId, setSessionData]);





  return (
    <div className="flex flex-col h-full relative overflow-x-hidden overflow-y-hidden">

      <ViewportProvider>
        <MessageWebSocketProvider>
        <EditorErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse">Loading editor...</div>
            </div>
          }>
            <Outlet context={{ theme, sessionId: sessionData?.sessionId }} />
          </Suspense>
        </EditorErrorBoundary>
        </MessageWebSocketProvider>
      </ViewportProvider>


      </div>

  );
};

const EditorLayout: React.FC = () => {

  const { sessionId } = useParams();


  return (
    <EditorProvider>
      <EditorLayoutContent existingSessionId={sessionId} />
    </EditorProvider>
  );
};

export default EditorLayout;


