import { ClientMessageTypes, ServerMessageTypes, WS_MESSAGE_TYPES } from "@/lib/webSocket.config";


export type MessageState = 'sending' | 'sent' | 'delivered' | 'failed' | 'deleted' | 'seen' | 'removed' ;

export type MessageStatesObject = {
  userId: string,
  messageMongoId: string,
  state: MessageState,
  _id: string,
  isShow: boolean,
  description: string,
  tags: string[],
  status: string,
  version: string,
  __v: number,
  createdAt: string,
  updatedAt: string
}

export interface OnlineUserInterface {
  userId: string;
  initials: string;
  fullName: string;
  isOnline: boolean;
  isAdmin?: boolean;
  connectedAt: number | string | Date;
  lastSeenAt: number | string | Date;
  isShow?: boolean;
  sessionId?: string;
}

export interface CurrentUserInterface {
  userId?: string;
  fullName?: string | null;
  sessionId?: string;
  createdAt?: number | string | Date;
  updatedAt?: number | string | Date;
  color?: string;
  isTyping?: boolean;
  messages?: {
    fullName: string;
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
  userIdentifier?: CurrentUserInterface;
  chatWidth?: number;
  chatPosition?: "side" | "bottom";
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



export interface ServerChatMessageInterface {
  _id?: string;
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

export interface ClientUserRequestToJoinSessionInterface extends BaseMessage {
  type: typeof WS_MESSAGE_TYPES.CLIENT_USER_REQUEST_TO_JOIN_SESSION;
  sessionId: string;
  guests: {
    userId: string;
    fullName: string;
  }[];
}


export interface ClientSessionAcceptedToJoinInterface extends BaseMessage {
  type: typeof WS_MESSAGE_TYPES.CLIENT_SESSION_ACCEPTED_TO_JOIN;
  sessionId: string;
  userId: string;
  fullName: string;
  guestId: string;
}

export interface ClientSessionRejectedToJoinInterface extends BaseMessage {
  type: typeof WS_MESSAGE_TYPES.CLIENT_SESSION_REJECTED_TO_JOIN;
  sessionId: string;
  userId: string;
  fullName: string;
  guestId: string;
}

export interface ServerUserJoinedSessionInterface extends BaseMessage {
  type: typeof WS_MESSAGE_TYPES.SERVER_USER_JOINED_SESSION;
  autoJoin?: boolean;
  participants?: OnlineUserInterface[];
  guests: OnlineUserInterface[];
  messages: ChatMessageInterface[];
  sessionId?: string;
}

export interface ClientUserHandleAutoJoinInterface extends BaseMessage {
  type: typeof WS_MESSAGE_TYPES.CLIENT_USER_HANDLE_AUTO_JOIN;
  sessionId: string;
  userId?: string;
  autoJoin?: boolean;
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
  messages: ChatMessageInterface[];
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
  _id?: string;
  type: ClientMessageTypes | ServerMessageTypes;
  sessionId: string;
  userId: string;
  fullName: string;
  content: string;
  createdAt: string | Date;
  messageId: string;
  state?: ChatMessageStateObject[];
}


export type ChatMessageStateObject = {
  userId: string;
  state: MessageState;
  messageMongoId: string;
}

export interface ChatMessageStateInterface {
  userId: string;
  state: MessageState | ChatMessageStateObject[];
}

export interface ServerUserRequestToJoinSessionInterface extends BaseMessage {
  type: typeof WS_MESSAGE_TYPES.SERVER_USER_REQUEST_TO_JOIN_SESSION;
  userId: string;
  fullName: string;
  sessionId: string;
}

export interface ServerUserRequestToJoinSessionToAdminInterface {
  type: typeof WS_MESSAGE_TYPES.SERVER_USER_REQUEST_TO_JOIN_SESSION_TO_ADMIN;

  sessionId: string;
  guests: {
    userId: string;
    fullName: string;
  }[];
}

export interface ServerUserRequestToJoinSessionToGuestInterface {
  type: typeof WS_MESSAGE_TYPES.SERVER_USER_REQUEST_TO_JOIN_SESSION_TO_GUEST;
  userId: string;
  fullName: string;
  sessionId: string;
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
  | ServerChatReactionRemoveInterface
  | ServerUserRequestToJoinSessionInterface
  | ServerUserRequestToJoinSessionToAdminInterface
  | ServerUserRequestToJoinSessionToGuestInterface;


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
  | ClientChatReactionRemoveInterface
  | ClientSessionAcceptedToJoinInterface
  | ClientSessionRejectedToJoinInterface
  | ClientUserRequestToJoinSessionInterface
  | ClientUserHandleAutoJoinInterface;


export type SessionHandlerActionInterface = "acceptedToJoin" | "rejectedToJoin" | "requestToJoin" | "leaveSession";
