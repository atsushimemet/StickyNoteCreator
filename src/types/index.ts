export interface Platform {
  name: string;
  price: number;
  url: string;
}

export interface Review {
  stars: number;
  count: number;
}

export interface Book {
  title: string;
  platforms: Platform[];
  review: Review;
}

export interface FormattedOutput {
  text: string;
  books: Book[];
}

export interface AuthState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  isTwoFactorEnabled: boolean;
  requiresPasswordChange: boolean;
}

export interface TwoFactorCode {
  code: string;
  expiresAt: number;
} 
