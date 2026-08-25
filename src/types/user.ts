export type UserRole = 'buyer' | 'seller' | 'admin' | string;

export interface EducationItem {
  title: string;
  institution?: string;
  year?: string;
}

export interface ExperienceItem {
  title: string;
  company?: string;
  duration?: string;
}

export interface User {
  _id?: string;
  id?: string;
  name?: string;
  username: string;
  email: string;
  isSeller: boolean;
  isAdmin?: boolean;
  role?: UserRole;
  img?: string | null;
  image?: string | null;
  country?: string;
  phone?: string;
  description?: string;
  shortTitle?: string;
  portfolio?: string[];
  isVerified?: boolean;
  isKycVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  skills?: string[];
  languages?: string[];
  education?: EducationItem[];
  experience?: ExperienceItem[];
  rating?: number;
  totalReviews?: number;
  starNumber?: number;
  totalStars?: number;
  earnings?: number;
  activeOrders?: number;
  [key: string]: any;
}

export interface JwtPayload {
  id?: string;
  _id?: string;
  userId?: string;
  username?: string;
  email?: string;
  isSeller?: boolean;
  isAdmin?: boolean;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}
