import { WS_MESSAGE_TYPES } from "@/lib/webSocket.config";

export interface OnlineUserInterface {
  userId: string;
  initials: string;
  fullName: string;
  isOnline: boolean;
  connectedAt: number | string | Date;
  lastSeenAt: number | string | Date;
  isShow?: boolean;
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
  chatPosition?: "side" | "bottom";
  createdAt?: number | string | Date;
  updatedAt?: number | string | Date;
}

export interface MessageInterface {
  type?: string;
  sessionId?: string;
  userId?: string;
  fullName?: string;
  content: string;
  createdAt?: number | string | Date;
  updatedAt?: number | string | Date;
}

export interface BaseMessage {
  type: string;
  createdAt?: string | Date;
  timestamp?: number | string | Date;
}

export interface JoinSessionMessageInterface extends BaseMessage {
  type: typeof WS_MESSAGE_TYPES.CLIENT_USER_JOINED_SESSION;
  sessionId: string;
  userId: string;
  fullName: string;
  createdAt: string | Date;
}

export interface ChatMessageInterface extends BaseMessage {
  type: typeof WS_MESSAGE_TYPES.CLIENT_CHAT;
  sessionId: string;
  userId: string;
  fullName: string;
  content: string;
  createdAt: string | Date;
}

export interface ServerChatMessageInterface
  extends Omit<ChatMessageInterface, "type"> {
  type: typeof WS_MESSAGE_TYPES.SERVER_CHAT;
}

export interface PingMessageInterface extends BaseMessage {
  type: typeof WS_MESSAGE_TYPES.CLIENT_PING;
  sessionId: string;
  userId: string;
}

export interface PongMessageInterface extends BaseMessage {
  type: "pong";
}

export interface JoinSessionMessageInterface extends BaseMessage {
  type: typeof WS_MESSAGE_TYPES.CLIENT_USER_JOINED_SESSION;
  sessionId: string;
}

export interface SystemMessageInterface extends BaseMessage {
  type: "system";
  message: string;
  level?: "info" | "warning" | "error";
}

export interface AuthMessageInterface extends BaseMessage {
  type: typeof WS_MESSAGE_TYPES.CLIENT_AUTH;
  sessionId: string;
  userId: string;
}

export interface ClientUserJoinedSessionInterface extends BaseMessage {
  type: typeof WS_MESSAGE_TYPES.CLIENT_USER_JOINED_SESSION;
  sessionId: string;
  userId: string;
  fullName: string;
}

export interface ServerUserJoinedSessionInterface extends BaseMessage {
  type: typeof WS_MESSAGE_TYPES.SERVER_USER_JOINED_SESSION;
  participants: OnlineUserInterface[];
}

export interface ClientUserDisconnectedInterface extends BaseMessage {
  userId?: string;
  type: typeof WS_MESSAGE_TYPES.CLIENT_USER_DISCONNECTED;
  lastSeenAt: string | Date;
}

export interface ServerUserDisconnectedInterface
  extends Omit<ClientUserDisconnectedInterface, "type"> {
  type: typeof WS_MESSAGE_TYPES.SERVER_USER_DISCONNECTED;
}

export interface ServerPongInterface extends BaseMessage {
  type: typeof WS_MESSAGE_TYPES.SERVER_PONG;
}

export interface ServerSessionMessagesInterface extends BaseMessage {
  type: typeof WS_MESSAGE_TYPES.SERVER_SESSION_MESSAGES;
  messages: MessageInterface[];
}

export type ServerMessage =
  | ServerChatMessageInterface
  | ServerUserJoinedSessionInterface
  | ServerUserDisconnectedInterface
  | ServerPongInterface
  | ServerSessionMessagesInterface;

export type ClientMessage =
  | ChatMessageInterface
  | PingMessageInterface
  | PongMessageInterface
  | SystemMessageInterface
  | AuthMessageInterface
  | ClientUserJoinedSessionInterface
  | ClientUserDisconnectedInterface;
