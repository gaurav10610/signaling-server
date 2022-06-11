export interface GetUserStatusResponse {
  status: boolean;
}

export interface GetActiveGroupUsers {
  groupName: string;
  users: string[]; // list of usernames for all the active users in a group
}

export interface GetActiveUsersResponse {
  groups: GetActiveGroupUsers[]; // list of usernames for all the active users
  nonGroupUsers: string[];
}

export interface GroupRegisterResponse {
  username: string;
  registered: boolean;
}
