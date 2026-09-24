import { UserProfile } from '../types';

export const ADMIN_EMAILS = [
  'admin@sahayakassociates.org',
  'editor@sahayakassociates.org'
];

export const isAuthorizedAdminAccount = (user?: UserProfile | null): boolean => {
  if (!user) return false;

  const email = (user.email || '').trim().toLowerCase();

  return (
    ADMIN_EMAILS.includes(email) &&
    ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(user.role)
  );
};
