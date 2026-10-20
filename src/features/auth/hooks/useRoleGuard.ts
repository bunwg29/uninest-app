import { useAuthStore } from '../store';
import { USER_ROLES } from '@core';

export const useRoleGuard = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isLandlord = isAuthenticated && user?.role === USER_ROLES.LANDLORD;

  const isStudent = isAuthenticated && user?.role === USER_ROLES.STUDENT;

  return { isLandlord, isStudent, isAuthenticated };
};
