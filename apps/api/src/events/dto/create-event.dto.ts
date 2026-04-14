export class CreateEventDto {
  title: string;
  description?: string;
  coverImage?: string;
  date: string; // ISO date string
  venue: string;
  ticketUrl?: string;
  guestLimit: number;
  autoApproveAll?: boolean;
  autoApproveFemale?: boolean;
}
