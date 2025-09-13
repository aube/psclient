export interface User {
  id: number;
  username: string;
  email: string;
  token?: string;
  password?: string;
  password_confirmation?: string;
}
