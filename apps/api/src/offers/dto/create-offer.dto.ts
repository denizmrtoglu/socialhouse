export class CreateOfferDto {
  eventId: string;
  type: 'BISTRO' | 'BACKSTAGE';
  note?: string;
}
