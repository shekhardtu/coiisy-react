import { getCurrentTimeStamp, local } from '@/lib/utils';
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CurrentUserInterface, SessionDataInterface } from '../components/Editor.types';
import { JoinSessionModal } from '../components/JoinSessionModal';

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
  isJoinModalOpen: boolean;
  sessionStats: {
    onlineCount: number;
    totalCount: number;
  };
  setSessionStats: (sessionStats: { onlineCount: number; totalCount: number }) => void;
  isHeaderVisible: boolean;
  setIsHeaderVisible: (isVisible: boolean) => void;
  handleHeaderVisibility: (container: HTMLDivElement) => void;
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
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
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

  // Initialize session first
  useEffect(() => {
    if (sessionId) {
      const savedSession = local("json", STORAGE_KEY).get(`sessionIdentifier-${sessionId}`);
      if (savedSession) {
        setSessionId(sessionId);
        setSessionData(savedSession);
      }
    }
  }, [sessionId]);

  // Optimized session initialization
  const initializeSession = useCallback(async ({ sessionId }: { sessionId: string | undefined; }) => {
    setSessionId(sessionId);
    if (!sessionId) return;

    const savedSessionData = local("json", STORAGE_KEY).get(`sessionIdentifier-${sessionId}`);
    if (savedSessionData?.guestIdentifier) {
      setSessionData(savedSessionData);
      return;
    }
    setIsJoinModalOpen(true);
  }, []);

  const handleJoinSession = useCallback((fullName: string) => {

    if (!sessionId || !fullName.trim()) return;

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
      createdAt: getCurrentTimeStamp()
    };

    setSessionData(newSessionData);
    setSessionId(sessionId);
    local("json", STORAGE_KEY).set(`sessionIdentifier-${sessionId}`, newSessionData);

    setIsJoinModalOpen(false);

  }, [sessionId]);



  // Persist session data changes
  useEffect(() => {
    if (sessionId && sessionData) {
      local("json", STORAGE_KEY).set(`sessionIdentifier-${sessionId}`, sessionData);
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
    initializeSession,
    handleThemeChange,
    isJoinModalOpen,
    sessionStats,
    setSessionStats,
    isHeaderVisible,
    setIsHeaderVisible,
    handleHeaderVisibility,
  }), [
    theme,
    cursorPosition,
    isWebSocketConnected,
    sessionData,
    sessionId,
    handleThemeChange,
    initializeSession,
    isJoinModalOpen,
    sessionStats,
    isHeaderVisible,
    handleHeaderVisibility,
  ]);



  return (
    <EditorContext.Provider value={contextValue}>
      {children}
      <JoinSessionModal
        isOpen={isJoinModalOpen}
        onJoin={handleJoinSession}
        sessionName={sessionId}
        sessionUrl={window.location.href}
        onlineCount={sessionStats.onlineCount}
        totalCount={sessionStats.totalCount}
      />
    </EditorContext.Provider>
  );
};
// Remove the useEditor hook and add this export
export { EditorContext };

