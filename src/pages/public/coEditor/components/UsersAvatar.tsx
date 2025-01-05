import { cn } from "@/lib/utils";
import React from 'react';

import { useParams } from "react-router-dom";
import { OnlineUserInterface, ServerTypingUserInterface } from "./Editor.types";
import UserAvatar, { AVATAR_SIZE_CLASSES } from './UserAvatar';

interface UserAvatarsProps {
  users: OnlineUserInterface[] | ServerTypingUserInterface[];
  size?: keyof typeof AVATAR_SIZE_CLASSES;
}



const UsersAvatars: React.FC<UserAvatarsProps> = ({ users, size = 'default' }) => {
  const sizeClass = AVATAR_SIZE_CLASSES[size];
  const { sessionId } = useParams();



  return (
    <div className={cn("flex items-center", sizeClass.spacing)}>
      {users.filter(user => user.sessionId === sessionId).map((user) => user.isShow && (
        <UserAvatar key={user.userId} user={user} size={size} />
      ))}
    </div>
  );
};

export default UsersAvatars;
