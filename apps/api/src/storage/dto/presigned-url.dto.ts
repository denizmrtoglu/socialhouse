export class PresignedUrlDto {
  type: 'profile' | 'event-cover';
  extension: string;
  eventId?: string; // required when type === 'event-cover'
}
