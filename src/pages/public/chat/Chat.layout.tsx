import EditorErrorBoundary from "@/components/editor/EditorErrorBoundary";
import { getCurrentTimeStamp } from "@/lib/utils";
import React, { Suspense, useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import EditorFooter from "../coEditor/components/EditorFooter";
import EditorHeader from "../coEditor/components/EditorHeader";
import { EditorProvider } from "../coEditor/contexts/Editor.context";
import useEditorContext from "../coEditor/hooks/useEditor.contexthook";
const EditorLayoutContent: React.FC<{ existingSessionId: string | undefined }> = ({ existingSessionId }) => {
  const {
    theme,
    handleThemeChange,
    cursorPosition,
    isWebSocketConnected,
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
      navigate(`/chat/${sessionId}`);
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
    <div className="flex flex-col min-h-screen">
      <EditorHeader onThemeChange={handleThemeChange} theme={theme} />
      <main className="flex-1 relative">
        <EditorErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse">Loading editor...</div>
            </div>
          }>
            <Outlet context={{ theme, sessionId: sessionData?.sessionId }} />
          </Suspense>
        </EditorErrorBoundary>
      </main>
      <EditorFooter
        cursorPosition={cursorPosition}
        isWebSocketConnected={isWebSocketConnected}
        className="sticky bottom-0 left-0 right-0"
      />
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


