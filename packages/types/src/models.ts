import { ApplicationStatus, Gender, OfferStatus, OfferType } from "./enums";

export interface User {
  id: string;
  clerkId: string;
  firstName: string;
  lastName: string;
  instagram: string;
  email: string;
  gender: Gender | null;
  birthDate: string | null; // ISO date string
  occupation: string | null;
  profilePhoto: string | null; // S3 URL
  expoPushToken: string | null;
  deletedAt: string | null; // ISO date string, soft-delete
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null; // S3 URL
  date: string; // ISO date string
  venue: string;
  ticketUrl: string | null;
  guestLimit: number;
  autoApproveAll: boolean;
  autoApproveFemale: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  userId: string;
  eventId: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
  event?: Event;
}

export interface Offer {
  id: string;
  userId: string;
  eventId: string;
  type: OfferType;
  note: string | null;
  adminNote: string | null;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
  event?: Event;
}
