export type UserStatus = 'online' | 'offline' | 'away';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  status: UserStatus;
  lastSeen?: Date;
  createdAt: Date;
}

