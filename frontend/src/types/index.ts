export type Role = 'VIEWER' | 'PUBLISHER' | 'ADMIN' | 'SUPER_ADMIN';
export type ListingType = 'JOB' | 'REAL_ESTATE' | 'PRODUCT' | 'SERVICE';
export type ListingStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REJECTED' | 'SOLD';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP' | 'REMOTE';
export type PropertyType = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'OFFICE' | 'LAND' | 'COMMERCIAL' | 'WAREHOUSE';
export type PropertyDeal = 'RENT' | 'SALE' | 'LEASE';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: Role;
  isVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  bio?: string;
  website?: string;
  company?: string;
  location?: string;
  createdAt: string;
  _count?: { listings: number; favorites: number; reviews: number };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  listingType: ListingType;
  _count?: { listings: number };
}

export interface JobDetail {
  id: string;
  jobType: JobType;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  salaryPeriod: string;
  skills: string[];
  benefits: string[];
  requirements: string[];
  responsibilities: string[];
  applicationDeadline?: string;
  openPositions: number;
  isRemote: boolean;
  companyName?: string;
  companyLogo?: string;
  companyWebsite?: string;
}

export interface PropertyDetail {
  id: string;
  propertyType: PropertyType;
  deal: PropertyDeal;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  furnished: boolean;
  parking: boolean;
  balcony: boolean;
  elevator: boolean;
  pool: boolean;
  gym: boolean;
  securitySystem: boolean;
  petFriendly: boolean;
  amenities: string[];
}

export interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: ListingType;
  status: ListingStatus;
  price?: number;
  priceUnit?: string;
  currency: string;
  location?: string;
  city?: string;
  country: string;
  images: string[];
  tags: string[];
  views: number;
  isFeatured: boolean;
  isPremium: boolean;
  isUrgent: boolean;
  expiresAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  categoryId: string;
  category: Category;
  user: Partial<User>;
  jobDetails?: JobDetail;
  propertyDetails?: PropertyDetail;
  _count?: { favorites: number; applications: number };
}

export interface Message {
  id: string;
  content: string;
  type: string;
  status: string;
  senderId: string;
  conversationId: string;
  attachments: string[];
  isDeleted: boolean;
  createdAt: string;
  sender: Partial<User>;
}

export interface Conversation {
  id: string;
  lastMessage?: string;
  lastMessageAt?: string;
  participants: Array<{ user: Partial<User>; lastReadAt?: string }>;
  otherParticipants: Partial<User>[];
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  type: string;
  price: number;
  currency: string;
  interval: string;
  features: Record<string, unknown>;
  maxListings: number;
  featuredListings: number;
  premiumListings: number;
}

export interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd: string;
  plan: Plan;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}
