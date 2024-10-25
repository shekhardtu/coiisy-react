import EditorErrorBoundary from "@/components/editor/EditorErrorBoundary";
import { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import EditorFooter from "../components/EditorFooter";
import EditorHeader from "../components/EditorHeader";
import { EditorProvider } from "../contexts/Editor.context";
import { useEditorContext } from "../hooks/useEditor.contexthook";

const EditorLayoutContent: React.FC = () => {
  const {
    theme,
    handleThemeChange,
    cursorPosition,
    isWebSocketConnected,
    sessionData,
    initializeSession,
  } = useEditorContext();

  // Run initialization only once when component mounts
  useEffect(() => {
    if (!sessionData?.guestIdentifier) {
      initializeSession();
    }
  }, [sessionData?.guestIdentifier, initializeSession]);

  // Prevent render until we have session data
  if (!sessionData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <EditorHeader onThemeChange={handleThemeChange} theme={theme} />
      <main className="flex-1 relative">
        <EditorErrorBoundary>
          <Suspense fallback={<div>Loading editor...</div>}>
            <Outlet context={{ theme, sessionId: sessionData?.sessionId }} />
          </Suspense>
        </EditorErrorBoundary>
      </main>
      <EditorFooter
        cursorPosition={cursorPosition}
        isWebSocketConnected={isWebSocketConnected}
      />
    </div>
  );
};

const EditorLayout: React.FC = () => {


  return (
    <EditorProvider>
      <EditorLayoutContent />
    </EditorProvider>
  );
};

export default EditorLayout;


