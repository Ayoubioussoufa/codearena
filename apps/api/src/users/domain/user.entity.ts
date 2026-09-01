export type Role = 'USER' | 'ADMIN';

export type User = {
  id: string;
  email: string;
  username: string;
  role: Role;
};
