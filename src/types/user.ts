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

export interface RatingBreakdown {
  communication?: number;
  qualityOfDelivery?: number;
  valueOfDelivery?: number;
  [key: string]: any;
}

export interface StarCounts {
  "1"?: number;
  "2"?: number;
  "3"?: number;
  "4"?: number;
  "5"?: number;
  [key: string]: number | undefined;
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
  categories?: string[];
  onboardingCompleted?: boolean;
  languages?: string[];
  education?: EducationItem[];
  experience?: ExperienceItem[];
  rating?: number;
  starRating?: number;
  totalReviews?: number;
  starNumber?: number;
  totalStars?: number;
  ratingBreakdown?: RatingBreakdown;
  starCounts?: StarCounts;
  earnings?: number;
  activeOrders?: number;
  // Warning & Suspension policy fields
  isSuspended?: boolean;
  suspensionCount?: number;
  suspensionReason?: string;
  suspendedAt?: string;
  warningCount?: number;
  warningExpiresAt?: string;
  isWarningActive?: boolean;
  warningReason?: string;
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
  isSuspended?: boolean;
  suspensionCount?: number;
  isWarningActive?: boolean;
  warningExpiresAt?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}
