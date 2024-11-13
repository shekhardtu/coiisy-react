import { ClientMessageTypes, ServerMessageTypes, WS_MESSAGE_TYPES } from "@/lib/webSocket.config";


export type MessageState = 'sending' | 'sent' | 'delivered' | 'failed' | 'deleted' | 'seen' | 'removed' ;

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
  messageId?: string;
  state?: MessageState;
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



export interface ServerChatMessageInterface {
  type: typeof WS_MESSAGE_TYPES.SERVER_CHAT;
  sessionId: string;
  userId: string;
  fullName: string;
  content: string;
  createdAt: string | Date;
  state?: MessageState;
  messageId: string;
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

export interface ServerChatEditInterface extends BaseMessage {
  type: typeof WS_MESSAGE_TYPES.SERVER_CHAT_EDIT;
  messageId: string;
  content: string;

}

export interface ClientChatBaseInterface extends BaseMessage {
  userId: string;
  fullName: string;
  sessionId: string;
  state: MessageState;
  content: string;
  messageId: string;
}

export interface ServerChatBaseInterface extends BaseMessage {
  userId: string;
  fullName: string;
  sessionId: string;
  state: MessageState;
  content: string;
  messageId: string;
}

export interface ServerChatDeleteInterface extends ServerChatBaseInterface {
  type: typeof WS_MESSAGE_TYPES.SERVER_CHAT_DELETE;
}

export interface ServerChatReactInterface extends ServerChatBaseInterface {
  type: typeof WS_MESSAGE_TYPES.SERVER_CHAT_REACT;
}


export interface ServerChatReactionRemoveInterface extends ServerChatBaseInterface {
  type: typeof WS_MESSAGE_TYPES.SERVER_CHAT_REACTION_REMOVE;
}


export interface ClientChatEditInterface extends ClientChatBaseInterface {
  type: typeof WS_MESSAGE_TYPES.CLIENT_CHAT_EDIT;
  messageId: string;
  content: string;
  userId: string;
  fullName: string;
}

export interface ClientChatDeleteInterface extends ClientChatBaseInterface {
  type: typeof WS_MESSAGE_TYPES.CLIENT_CHAT_DELETE;
  messageId: string;
}

export interface ClientChatReactInterface extends ClientChatBaseInterface {
  type: typeof WS_MESSAGE_TYPES.CLIENT_CHAT_REACT;
  messageId: string;

}

export interface ClientChatReactionRemoveInterface extends ClientChatBaseInterface {
  type: typeof WS_MESSAGE_TYPES.CLIENT_CHAT_REACTION_REMOVE;
  messageId: string;
}

export type ClientChatMessageTypes = ClientMessageTypes;
export type ServerChatMessageTypes = ServerMessageTypes;

export interface ChatMessageInterface extends BaseMessage {
  type: ClientMessageTypes | ServerMessageTypes;
  sessionId: string;
  userId: string;
  fullName: string;
  content: string;
  createdAt: string | Date;
  messageId: string;
  state?: MessageState;
}



export type ServerMessage =
  | ServerChatMessageInterface
  | ServerUserJoinedSessionInterface
  | ServerUserDisconnectedInterface
  | ServerPongInterface
  | ServerSessionMessagesInterface
  | ServerChatEditInterface
  | ServerChatDeleteInterface
  | ServerChatReactInterface
  | ServerChatReactionRemoveInterface;

export type ClientMessage =
  | ChatMessageInterface
  | PingMessageInterface
  | PongMessageInterface
  | SystemMessageInterface
  | AuthMessageInterface
  | ClientUserJoinedSessionInterface
  | ClientUserDisconnectedInterface
  | ClientChatEditInterface
  | ClientChatDeleteInterface
  | ClientChatReactInterface
  | ClientChatReactionRemoveInterface;
