export interface RegisterResponseModel {
  message: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
  };
}
