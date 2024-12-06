import { WS_MESSAGE_TYPES } from '@/lib/webSocket.config';

export interface ChatMessageInterface {
  type: typeof WS_MESSAGE_TYPES;
  sessionId: string;
  userId: string;
  fullName: string;
  content: string;
  createdAt: string;
}




export interface ChatStatus {
  status: 'connected' | 'disconnected' | 'connecting' | 'reconnecting';
  tryConnect: () => void;
}


export interface NavigatorInterface {
  virtualKeyboard?: {
    boundingRect: DOMRect;
    overlaysContent: boolean;
    addEventListener: (event: string, handler: () => void) => void;
    removeEventListener: (event: string, handler: () => void) => void;
  };
}


export interface SessionStatusInterface {
  sessionHandler: (action: string) => void
  sessionStatus: 'requestedToJoin' | 'requestReceivedToJoin' | 'joined'
}

