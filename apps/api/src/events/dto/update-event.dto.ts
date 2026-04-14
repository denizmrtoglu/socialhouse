export class UpdateEventDto {
  title?: string;
  description?: string;
  coverImage?: string;
  date?: string;
  venue?: string;
  ticketUrl?: string;
  guestLimit?: number;
  autoApproveAll?: boolean;
  autoApproveFemale?: boolean;
  isActive?: boolean;
}
