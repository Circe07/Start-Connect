import { EdAt } from './created';
import { Member } from './member';

export interface Group {
  id: string;
  userId: string;
  name: string;
  description: string;
  sport: string;
  level: string;
  city: string;
  location: null;
  isPublic: boolean;
  members: Member[];
  maxMembers: number;
  createdAt: EdAt;
  updatedAt: null;
  postCount: number;
}
