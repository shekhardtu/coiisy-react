import { cn } from "@/lib/utils";
import React from 'react';

import { OnlineUserInterface } from "./Editor.types";
import UserAvatar, { AVATAR_SIZE_CLASSES } from './UserAvatar';

interface UserAvatarsProps {
  users: OnlineUserInterface[];
  size?: keyof typeof AVATAR_SIZE_CLASSES;
}



const UserAvatars: React.FC<UserAvatarsProps> = ({ users, size = 'default' }) => {
  const sizeClass = AVATAR_SIZE_CLASSES[size];

  return (
    <div className={cn("flex items-center", sizeClass.spacing)}>
      {users.map((user) => user.isShow && (
        <UserAvatar key={user.userId} user={user} size={size} />
      ))}
    </div>
  );
};

export default UserAvatars;
