export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  password?: string;
  loyaltyPoints?:number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface BackendAuthResponse {
    jwtToken: string;
    user: User;
}
