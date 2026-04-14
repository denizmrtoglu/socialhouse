export class UpdateOfferDto {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMMUNICATED';
  adminNote?: string;
}
