export interface OnlineUserInterface {
  userId?: string;
  initials: string;
  fullName: string;
  isOnline: boolean;
  connectedAt: Date;
  lastActiveAt: Date;
}

export interface CurrentUserInterface {

  userId?: string;
  fullName?: string | null;
  userName?: string;
  sessionId?: string;
  createdAt?: number | string | Date;
  updatedAt?: number | string | Date;
  color?: string;
  isTyping?: boolean;
  messages?: {
      userName: string;
      text: string;
      createdAt: string | number | Date;
      updatedAt: string | number | Date;
  }[];
  cursorPosition?: {
    line: number;
    column: number;
};
}

export interface SessionDataInterface {
  sessionId?: string;
  editorFocusMode?: boolean;
  editor?: {
    content?: string;
    language?: string;
  };
  theme?: "light" | "dark";
  guestIdentifier?: CurrentUserInterface;
  chatWidth?: number;
  chatPosition?: 'side' | 'bottom';
  createdAt?: number | string | Date;
  updatedAt?: number | string | Date;
}

export interface MessageInterface {
  type?: string;
  sessionId?: string;
  userId?: string;
  userName?: string;
  content: string;
  createdAt?: number | string | Date;
  updatedAt?: number | string | Date;
}
