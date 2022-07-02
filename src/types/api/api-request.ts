export interface UserRegisterRequest {
  username: string;
  connectionId: string;
  needRegister: boolean; // flag to distinguish register or de-register request
}

export interface GroupRegisterRequest {
  username: string;
  groupName: string;
  connectionId: string;
  needRegister: boolean; // flag to distinguish register or de-register request
}
