export class BulkActionDto {
  ids: string[];
  status: 'APPROVED' | 'REJECTED';
}
