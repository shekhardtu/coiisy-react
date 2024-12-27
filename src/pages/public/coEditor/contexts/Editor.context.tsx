import { local } from '@/lib/utils';
import { Frame, LucideIcon } from 'lucide-react';
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SessionDataInterface } from '../components/Editor.types';

interface EditorContextType {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  cursorPosition: { line: number; column: number };
  setCursorPosition: (position: { line: number; column: number }) => void;
  isWebSocketConnected: boolean;
  setIsWebSocketConnected: (connected: boolean) => void;
  sessionData: SessionDataInterface | null;
  setSessionData: (sessionData:   SessionDataInterface | null) => void;
  handleThemeChange: (newTheme: "light" | "dark") => void;
  setSessionId: (sessionId: string | undefined) => void;
  sessionId: string | undefined;


  setSessionStats: (sessionStats: { onlineCount: number; totalCount: number }) => void;
  isHeaderVisible: boolean;
  setIsHeaderVisible: (isVisible: boolean) => void;
  handleHeaderVisibility: (container: HTMLDivElement) => void;

  chatSessions: {
    name: string | undefined;
    url: string;
    icon: LucideIcon;
    session: SessionDataInterface;
  }[];
  setChatSessions: (chatSessions: {
    name: string | undefined;
    url: string;
    icon: LucideIcon;
    session: SessionDataInterface;
  }[]) => void;

}

const EditorContext = createContext<EditorContextType | undefined>(undefined);


// Create a stable key for localStorage
const STORAGE_KEY = 'sessionIdentifier';

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
  const [chatSessions, setChatSessions] = useState<{
    name: string | undefined;
    url: string;
    icon: LucideIcon;
    session: SessionDataInterface;
  }[]>([]);

  const [sessionStats, setSessionStats] = useState({
    onlineCount: 0,
    totalCount: 0
  });
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollTop = useRef(0);
  const headerTimeoutRef = useRef<NodeJS.Timeout>();

  const isMobileRef = useRef(window.innerWidth <= 768);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup function for timeouts
  const clearTimeouts = useCallback(() => {
    if (headerTimeoutRef.current) {
      clearTimeout(headerTimeoutRef.current);
    }
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
  }, []);



  useEffect(() => {
    const chatSessions = local('json', "sessionIdentifier").getAll();

    const chatSessionsArray = chatSessions.map((session) => {

      const sessionObject = Object.values(session)[0] as SessionDataInterface;
      return {
        name: sessionObject.sessionId,
        url: `${sessionObject.sessionId}`,
        icon: sessionObject.icon || Frame,
        session: sessionObject
      }
    });
    setChatSessions(chatSessionsArray);
  }, [sessionData]);






  // Initialize session first
  useEffect(() => {
    if (sessionId) {
      const savedSession = local("json", sessionId).get(STORAGE_KEY);
      if (savedSession) {
        setSessionData(savedSession);
      }
    }
  }, [sessionId]);

  // Persist session data changes
  useEffect(() => {
    if (sessionId && sessionData) {
      local("json", sessionId).set(STORAGE_KEY, sessionData);
    }
  }, [sessionData, sessionId]);

  // Theme handling
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleThemeChange = useCallback((newTheme: "light" | "dark") => {
    setTheme(newTheme);
    if (sessionData) {
      setSessionData(prev => prev ? { ...prev, theme: newTheme } : null);
    }
  }, [sessionData]);

  // Optimized header visibility handler
  const handleHeaderVisibility = useCallback((container: HTMLDivElement) => {
    if (isMobileRef.current) {
      setIsHeaderVisible(false);
      return;
    }

    const currentScrollTop = container.scrollTop;
    setIsHeaderVisible(prev => {
      const newValue = currentScrollTop < lastScrollTop.current;
      return prev !== newValue ? newValue : prev;
    });

    lastScrollTop.current = currentScrollTop;

    clearTimeout(headerTimeoutRef.current);
    headerTimeoutRef.current = setTimeout(() => {
      setIsHeaderVisible(false);
    }, 10000);
  }, []);

  // Optimized resize handler
  useEffect(() => {
    const handleResize = () => {
      clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        const wasMobile = isMobileRef.current;
        isMobileRef.current = window.innerWidth <= 768;

        if (wasMobile !== isMobileRef.current && isMobileRef.current) {
          setIsHeaderVisible(false);
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Initial check
    isMobileRef.current = window.innerWidth <= 768;
    if (isMobileRef.current) {
      setIsHeaderVisible(false);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeouts();
    };
  }, [clearTimeouts]);

  // Memoized context value
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
    handleThemeChange,
    sessionStats,
    setSessionStats,
    isHeaderVisible,
    setIsHeaderVisible,
    handleHeaderVisibility,
    chatSessions,
    setChatSessions
  }), [
    theme,
    cursorPosition,
    isWebSocketConnected,
    sessionData,
    sessionId,
    handleThemeChange,
    sessionStats,
    isHeaderVisible,
    handleHeaderVisibility,
    chatSessions
  ]);



  return (
    <EditorContext.Provider value={contextValue}>
      {children}

    </EditorContext.Provider>
  );
};
// Remove the useEditor hook and add this export
export { EditorContext };

