export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface UserResponse {
  message: string;
  user: User;
}
