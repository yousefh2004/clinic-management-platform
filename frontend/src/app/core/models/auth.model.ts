export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface CurrentUser {
  username: string;
  role: 'ADMIN' | 'STAFF';
}