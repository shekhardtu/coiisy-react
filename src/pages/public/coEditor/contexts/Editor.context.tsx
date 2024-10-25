import { getCurrentTimeStamp, local } from '@/lib/utils';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CurrentUserInterface, SessionDataInterface } from '../components/Editor.types';
interface EditorContextType {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  cursorPosition: { line: number; column: number };
  setCursorPosition: (position: { line: number; column: number }) => void;
  isWebSocketConnected: boolean;
  setIsWebSocketConnected: (connected: boolean) => void;
  sessionData: SessionDataInterface | null;
  setSessionData: (sessionData:   SessionDataInterface | null) => void;
  initializeSession: ({ sessionId }: { sessionId: string | undefined }) => Promise<void>;
  handleThemeChange: (newTheme: "light" | "dark") => void;
  setSessionId: (sessionId: string | undefined) => void;
  sessionId: string | undefined;

}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

// Create a stable key for localStorage
const STORAGE_KEY = 'key';

export const EditorProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {


  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return local("json", STORAGE_KEY).get('theme') || "light";
  });

  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [sessionData, setSessionData] = useState<SessionDataInterface | null>(null);

  // Initialize session first
  useEffect(() => {
    const currentSessionId = local("json", STORAGE_KEY).get('currentSessionId');
    if (currentSessionId) {
      const savedSession = local("json", STORAGE_KEY).get(`sessionIdentifier-${currentSessionId}`);
      if (savedSession) {
        setSessionId(currentSessionId);
        setSessionData(savedSession);
      }
    }
  }, []);

  const initializeSession = useCallback(async ({ sessionId }: { sessionId: string | undefined }) => {
    if (!sessionId) return;

    const savedSessionData = local("json", STORAGE_KEY).get(`sessionIdentifier-${sessionId}`);

    if (savedSessionData?.guestIdentifier) {
      setSessionData(savedSessionData);
      setSessionId(sessionId);
      return;
    }

    const fullName = prompt("Please enter your full name");
    if (!fullName?.trim()) return;

    const guestIdentifier: CurrentUserInterface = {
      fullName: fullName.trim(),
      userId: uuidv4(),
      createdAt: getCurrentTimeStamp(),
      messages: [],
      isTyping: false,
      cursorPosition: { line: 0, column: 0 },
      sessionId
    };

    const newSessionData = {
      guestIdentifier,
      sessionId,
      createdAt: Math.floor(Date.now() / 1000)
    };

    setSessionData(newSessionData);
    setSessionId(sessionId);
    local("json", STORAGE_KEY).set(`sessionIdentifier-${sessionId}`, newSessionData);
    local("json", STORAGE_KEY).set('currentSessionId', sessionId);
  }, []);

  // Persist session data changes
  useEffect(() => {
    if (sessionId && sessionData) {
      local("json", STORAGE_KEY).set(`sessionIdentifier-${sessionId}`, sessionData);
    }
  }, [sessionData, sessionId]);

  // Persist theme changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, sessionData]);

  const handleThemeChange = useCallback((newTheme: "light" | "dark") => {
    setTheme(newTheme);
    if (sessionData) {
      const updated = { ...sessionData, theme: newTheme };
      setSessionData(updated);

    }
  }, [sessionData]);

  const contextValue = useMemo(() => ({
    theme,
    setTheme,
    cursorPosition,
    setCursorPosition,
    isWebSocketConnected,
    setIsWebSocketConnected,
    sessionData,
    sessionId,
    setSessionId,
    setSessionData,
    initializeSession,
    handleThemeChange,
  }), [
    theme,
    cursorPosition,
    isWebSocketConnected,
    sessionData,
    sessionId,
    handleThemeChange,
    initializeSession
  ]);



  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

// Remove the useEditor hook and add this export
export { EditorContext };
