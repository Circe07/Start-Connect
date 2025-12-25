export interface GroupMessageProfile {
  userId: string;
  name?: string;
  username?: string;
  photo?: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  createdAt?: any;
  authorProfile?: GroupMessageProfile | null;
}
