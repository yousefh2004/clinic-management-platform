export type Role = 'ADMIN' | 'STAFF';

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: Role;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}