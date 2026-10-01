// Khaneh Bazaar - Type definitions

export type FieldType = "text" | "number" | "select" | "multiselect" | "boolean";

export interface CategoryField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  unit?: string;
}

export interface SubCategory {
  slug: string;
  name: string;
  icon: string;
  fields: CategoryField[];
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
  color: string;
  subs: SubCategory[];
}

export interface ListingImage {
  id: string;
  dataUrl: string; // base64 - replace with server URL when backend connected
  isPrimary: boolean;
}

export type PriceType = "fixed" | "negotiable" | "per_meter";
export type ListingStatus = "draft" | "pending" | "active" | "expired" | "sold" | "rejected";

export interface Listing {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  categoryName?: string;
  slug?: string;
  categorySlug: string;
  subSlug: string;
  title: string;
  shortDescription: string;
  description: string;
  price: number;
  priceType: PriceType;
  fields: Record<string, string | number | boolean | string[]>;
  images: ListingImage[];
  province: string;
  city: string;
  neighborhood?: string;
  address?: string;
  lat?: number;
  lng?: number;
  status: ListingStatus;
  views: number;
  createdAt: number;
  expiresAt: number;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  nationalCode?: string;
  avatar?: string;
  isAdmin: boolean;
  isVerified: boolean;
  createdAt: number;
}

export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessageAt: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  isRead: boolean;
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: "system" | "message" | "listing" | "renewal";
  title: string;
  body: string;
  isRead: boolean;
  createdAt: number;
}
