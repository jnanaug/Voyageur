
export interface TransitDetail {
  mode: string;
  duration: string;
  cost: string;
  instruction: string;
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  estimatedCost: string;
  transitFromPrev?: TransitDetail; // How to get here from the previous point
  bookingRequired: boolean;
  bookingLink?: string;
  coordinates?: { lat: number, lng: number }; // For map visualization
}

export interface DayPlan {
  day: string;
  theme: string;
  activities: Activity[];
}

export interface TravelOption {
  type: 'FLIGHT' | 'TRAIN' | 'BUS' | 'CAR';
  provider: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: string;
  departureLocation: string; // e.g. "Terminal 2, BLR"
  arrivalLocation: string;
  bookingLink: string;
}

export interface Accommodation {
  name: string;
  type: string;
  rating: string;
  pricePerNight: string;
  location: string;
  description: string;
  amenities: string[];
  checkInTime: string;
  imageUrl: string; // For room photo
}

export interface TripItinerary {
  destination: string;
  duration: string;
  totalEstimatedCost: string;
  summary: string;
  travelOptions: TravelOption[]; // Ways to reach the destination
  accommodation: Accommodation[]; // Where to stay
  days: DayPlan[]; // The daily plan
}

export enum AppView {
  LANDING = 'LANDING',
  PLANNER = 'PLANNER',
  DINING = 'DINING',
  AUTH = 'AUTH',
  ABOUT = 'ABOUT',
  HOW_IT_WORKS = 'HOW_IT_WORKS',
  DASHBOARD = 'DASHBOARD',
  PRICING = 'PRICING',
  BLOG = 'BLOG',
  REWARDS = 'REWARDS',
  WALLET = 'WALLET',
  SUPPORT = 'SUPPORT',
  TRAVEL_DNA = 'TRAVEL_DNA',
  COMMUNITY = 'COMMUNITY',
  MARKETPLACE = 'marketplace',
  ACHIEVEMENTS = 'achievements',
  SUSTAINABILITY = 'sustainability',
  REFERRAL = 'referral',
  INTEGRATIONS = 'integrations',
  PRIVACY = 'privacy',
  TERMS = 'terms'
}

export interface DiningRecommendation {
  restaurantName: string;
  cuisine: string;
  dishName: string;
  description: string;
  price: string;
  rating: string;
  ambiance: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  createdAt: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  imageUrl: string;
  date: string;
}

export interface RewardTier {
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  minPoints: number;
  benefits: string[];
  color: string;
}