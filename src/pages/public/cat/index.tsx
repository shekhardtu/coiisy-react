import React, { FormEvent, useEffect } from 'react';
import './style.css';

interface Message {
  text: string;
  sender: 'me' | 'them';
}

interface VirtualKeyboardEvent extends Event {
  target: EventTarget & {
    boundingRect: DOMRect;
  };
}

interface Navigator extends globalThis.Navigator {
  virtualKeyboard?: {
    overlaysContent: boolean;
    show(): void;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
  }
}

const CatPage: React.FC = () => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState<string>('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Add type assertion for navigator
  const nav = navigator as Navigator;

  // Add secure context and virtual keyboard checks in useEffect
  useEffect(() => {
    if (!window.isSecureContext) {
      window.location.protocol = "https:";
    }

    const virtualKeyboardSupported = "virtualKeyboard" in nav;

    if (!virtualKeyboardSupported) {
      setMessages([{
        text: "😔 Your device does not support the VirtualKeyboard API.",
        sender: 'me'
      }]);
      return;
    }

    // Setup virtual keyboard
    if (nav.virtualKeyboard) {
      const keyboard = nav.virtualKeyboard;
      keyboard.overlaysContent = true;

      const handleGeometryChange = (e: VirtualKeyboardEvent) => {
        let { x, y, width, height } = e.target.boundingRect;
        x = Math.abs(x);
        y = Math.abs(y);
        width = Math.abs(width);
        height = Math.abs(height);

        setMessages(prev => [...prev, {
          text: `⌨️ geometrychange<br>x: ${x} y: ${y} width: ${width} height: ${height}`,
          sender: 'me'
        }]);
      };

      keyboard.addEventListener("geometrychange", handleGeometryChange as EventListener);
      return () => keyboard.removeEventListener("geometrychange", handleGeometryChange as EventListener);
    }
  }, []);

  const writeMessage = (): void => {
    if (!inputRef.current?.value) return;



    setMessages(prev => [...prev, {
      text: inputValue,
      sender: 'me'
    }]);

    setInputValue('');

    // Simulate response
    setTimeout(() => {
      const responses = ["LOL, yeah!", "What?", "No way.", "Awesome!!1!"];
      setMessages(prev => [...prev, {
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'them'
      }]);
    }, Math.floor(Math.random() * 3 + 1) * 500);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    writeMessage();
    inputRef.current?.focus();
    if (nav.virtualKeyboard) {
      nav.virtualKeyboard.show();
    }

  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  // Viewport height adjustment
  useEffect(() => {
    const setViewportHeight = () => {
      document.documentElement.style.setProperty(
        "--100vh",
        `${window.innerHeight}px`
      );
    };

    // Set initial height
    setViewportHeight();

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(setViewportHeight, 100);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="container">
      <div className="messages">
        <ul>
          {messages.map((message, index) => (
            <li key={index} className={message.sender}>
              {message.text}
            </li>
          ))}
          <div ref={messagesEndRef} />
        </ul>
      </div>
      <div className="compose">
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              fill="currentColor"
            >
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path
                d="M4.01 6.03l7.51 3.22-7.52-1 .01-2.22m7.5 8.72L4 17.97v-2.22l7.51-1M2.01 3L2 10l15 2-15 2 .01 7L23 12 2.01 3z"
              />
            </svg>
            <div>Send</div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CatPage;