export interface LoginResponseModel {
  accessToken: string;
  refreshToken: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}
