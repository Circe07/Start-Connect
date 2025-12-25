import { EdAt } from './created';

export interface GroupRequestProfile {
  userId: string;
  name?: string;
  username?: string;
  photo?: string;
}

export interface GroupRequest {
  id: string;
  groupId: string;
  userId: string;
  status: string;
  createdAt: EdAt;
  updatedAt?: EdAt | null;
  requesterProfile?: GroupRequestProfile | null;
}
