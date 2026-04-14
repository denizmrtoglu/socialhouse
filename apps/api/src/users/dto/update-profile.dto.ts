export class UpdateProfileDto {
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate?: string;
  occupation?: string;
  profilePhoto?: string;
}
