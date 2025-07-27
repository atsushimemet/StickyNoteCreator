export interface Platform {
  name: string;
  price: number;
  url: string;
}

export const DEFAULT_PLATFORMS: Platform[] = [
  { name: 'Amazon(Kindle)', price: 0, url: '' },
  { name: 'Amazon(書籍)', price: 0, url: '' },
  { name: 'メルカリ', price: 0, url: '' },
  { name: '楽天', price: 0, url: '' }
];

export interface Review {
  stars: number;
  count: number;
}

export interface Book {
  title: string;
  author: string;
  platforms: Platform[];
  review: Review;
}

export interface PostData {
  postTitle: string;
  targetAudience: string;
  books: Book[];
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
