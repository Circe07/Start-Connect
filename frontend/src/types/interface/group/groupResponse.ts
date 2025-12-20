import { Group } from './group';

export interface GroupResponse {
  groups: Group[];
  hasMore: boolean;
  nextStartAfterId: null;
}
