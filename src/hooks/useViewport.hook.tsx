import { useEffect, useState } from "react";

export const useViewport = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isKeyboardSupported] = useState(() =>
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  );

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

    window.visualViewport?.addEventListener("resize", handleResize);
    window.addEventListener("resize", handleResize);

    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { keyboardHeight, keyboardVisible, isKeyboardSupported, isMobile, setIsMobile };
};
