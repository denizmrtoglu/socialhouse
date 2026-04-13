import { ApplicationStatus, Gender, OfferStatus, OfferType } from "./enums";

// --- Auth / Webhooks ---

export interface ClerkWebhookPayload {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    first_name: string;
    last_name: string;
    email_addresses: Array<{ email_address: string; id: string }>;
    primary_email_address_id: string;
  };
}

// --- Users ---

export interface UpdateProfileDto {
  gender?: Gender;
  birthDate?: string;
  occupation?: string;
  profilePhoto?: string;
}

export interface UpdatePushTokenDto {
  expoPushToken: string;
}

// --- Storage ---

export interface PresignedUrlRequestDto {
  type: "profile" | "event-cover";
  extension: string;
  eventId?: string; // required when type === "event-cover"
}

export interface PresignedUrlResponseDto {
  uploadUrl: string;
  fileUrl: string;
}

// --- Events ---

export interface CreateEventDto {
  title: string;
  description?: string;
  coverImage?: string;
  date: string;
  venue: string;
  ticketUrl?: string;
  guestLimit: number;
  autoApproveAll?: boolean;
  autoApproveFemale?: boolean;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

// --- Applications ---

export interface CreateApplicationDto {
  eventId: string;
}

export interface BulkApplicationActionDto {
  ids: string[];
  status: ApplicationStatus.APPROVED | ApplicationStatus.REJECTED;
}

// --- Offers ---

export interface CreateOfferDto {
  eventId: string;
  type: OfferType;
  note?: string;
}

export interface UpdateOfferDto {
  status?: OfferStatus;
  adminNote?: string;
}

// --- Pagination ---

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
