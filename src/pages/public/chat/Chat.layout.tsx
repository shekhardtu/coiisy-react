import EditorErrorBoundary from "@/components/editor/EditorErrorBoundary";
import { cn, getCurrentTimeStamp } from "@/lib/utils";
import React, { Suspense, useContext, useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

import EditorHeader from "../coEditor/components/EditorHeader";
import { EditorContext, EditorProvider } from "../coEditor/contexts/Editor.context";
import useEditorContext from "../coEditor/hooks/useEditor.contexthook";
const EditorLayoutContent: React.FC<{ existingSessionId: string | undefined }> = ({ existingSessionId }) => {
  const editorContext = useContext(EditorContext);

  if (!editorContext) {
    throw new Error('EditorLayoutContent must be used within EditorProvider');
  }

  const { isHeaderVisible } = editorContext;

  const {
    theme,
    handleThemeChange,
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
    <div className="flex flex-col h-[100dvh] relative">
      <div
        className={cn(
          "transition-transform duration-300 fixed top-0 left-0 right-0 z-50",
          isHeaderVisible ? 'translate-y-0 ' : '-translate-y-full hidden'
        )}
      >
        <EditorHeader onThemeChange={handleThemeChange} theme={theme} />
      </div>
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


