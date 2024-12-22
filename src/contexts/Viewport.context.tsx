import React, { createContext, useContext, useEffect, useState } from "react";

interface ViewportContextType {
  keyboardHeight: number;
  keyboardVisible: boolean;
  isKeyboardSupported: boolean;
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
}

const ViewportContext = createContext<ViewportContextType>({
  keyboardHeight: 0,
  keyboardVisible: false,
  isKeyboardSupported: false,
  isMobile: false,
  setIsMobile: () => {},
});

export const ViewportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isKeyboardSupported] = useState(() => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));

  useEffect(() => {
    const initialHeight = window.innerHeight;
    const MIN_KEYBOARD_HEIGHT = 150;
    let resizeTimeout: NodeJS.Timeout | null = null;

    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);

      resizeTimeout = setTimeout(() => {
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const heightDiff = initialHeight - viewportHeight;

        const keyboardIsVisible = heightDiff > MIN_KEYBOARD_HEIGHT;
        setKeyboardVisible(keyboardIsVisible);
        setKeyboardHeight(keyboardIsVisible ? heightDiff : 0);
      }, 100); // Debounce resize events
    };

    const addListeners = () => {
      window.visualViewport?.addEventListener("resize", handleResize);
      window.addEventListener("resize", handleResize);
    };

    const removeListeners = () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", handleResize);
    };

    addListeners();
    return removeListeners;
  }, []);

  return (
    <ViewportContext.Provider
      value={{
        keyboardHeight,
        keyboardVisible,
        isKeyboardSupported,
        isMobile,
        setIsMobile,
      }}
    >
      {children}
    </ViewportContext.Provider>
  );
};

export const useViewport = () => useContext(ViewportContext);
