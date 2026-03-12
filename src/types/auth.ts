import { ROLE } from '@/lib/constants';

export type UserRole = (typeof ROLE)[keyof typeof ROLE];

export interface JwtPayloadUser {
  id: string;
  email: string;
  role: UserRole;
  // TODO: add restaurantId for managers if needed
}

