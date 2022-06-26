export interface UserRegisterRequest {
  username: string;
  needRegister: boolean; // flag to distinguish register or de-register request
}

export interface GroupRegisterRequest {
  username: string;
  groupName: string;
  needRegister: boolean; // flag to distinguish register or de-register request
}
