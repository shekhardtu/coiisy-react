import React, { createContext, useContext, useEffect, useState } from "react";

interface NavigatorWithVirtualKeyboard extends Navigator {
  virtualKeyboard?: {
    show: () => void
    hide: () => void
    overlaysContent: boolean
    boundingRect: DOMRect
    addEventListener: (event: string, callback: () => void) => void
    removeEventListener: (event: string, callback: () => void) => void
  }
}

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
})

export const ViewportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(() => {
    return window.innerWidth < 768
  })

  const [isKeyboardSupported] = useState(() => {
    // Check for both Chrome's VirtualKeyboard API and Safari's visualViewport API
    // check for browser support
    const isChrome = /chrome/i.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (isChrome) {
      return 'virtualKeyboard' in navigator
    }
    if (isSafari) {
      return 'visualViewport' in window
    }
    return false
  })

  useEffect(() => {
    // Initial viewport dimensions
    const initialHeight = window.innerHeight
    const MIN_KEYBOARD_HEIGHT = 150
    const VIEWPORT_UPDATE_DEBOUNCE = 100
    let resizeTimeout: NodeJS.Timeout | null = null

    // Handle Chrome's Virtual Keyboard API
    const virtualKeyboard = (navigator as NavigatorWithVirtualKeyboard).virtualKeyboard
    if (virtualKeyboard) {
      virtualKeyboard.overlaysContent = true

      const handleGeometryChange = () => {
        const { height } = virtualKeyboard.boundingRect
        setKeyboardHeight(height)
        setKeyboardVisible(height > 0)
      }

      virtualKeyboard.addEventListener('geometrychange', handleGeometryChange)
      return () => {
        virtualKeyboard.removeEventListener('geometrychange', handleGeometryChange)
      }
    }

    // Handle Safari's visualViewport API
    if (window.visualViewport) {
      const handleResize = () => {
        if (resizeTimeout) {
          clearTimeout(resizeTimeout)
        }

        resizeTimeout = setTimeout(() => {
          const newViewportHeight = window.visualViewport!.height
          const heightDiff = Math.abs(initialHeight - newViewportHeight)
          const isKeyboard = heightDiff > MIN_KEYBOARD_HEIGHT

          setKeyboardVisible(isKeyboard)
          setKeyboardHeight(isKeyboard ? heightDiff : 0)
        }, VIEWPORT_UPDATE_DEBOUNCE)
      }

      const visualViewport = window.visualViewport // Store reference to avoid null checks
      visualViewport.addEventListener('resize', handleResize)
      visualViewport.addEventListener('scroll', handleResize)

      return () => {
        if (resizeTimeout) {
          clearTimeout(resizeTimeout)
        }
        visualViewport.removeEventListener('resize', handleResize)
        visualViewport.removeEventListener('scroll', handleResize)
      }
    }

    // Fallback for older browsers
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }

      resizeTimeout = setTimeout(() => {
        const newHeight = window.innerHeight
        const heightDiff = initialHeight - newHeight

        setKeyboardVisible(heightDiff > MIN_KEYBOARD_HEIGHT)
        setKeyboardHeight(heightDiff > MIN_KEYBOARD_HEIGHT ? heightDiff : 0)
      }, VIEWPORT_UPDATE_DEBOUNCE)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [])

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
  )
}

export const useViewport = () => useContext(ViewportContext)