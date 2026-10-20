import { useQueryClient } from '@tanstack/react-query';
import { useMaintenanceStore } from '@core';
import { useAuth } from '@features/auth';
import { FAVORITE_IDS_QUERY_KEY } from '@features/search';
import { MaintenanceScreen } from '@features/support';
import { navigationRef } from '../navigationRef';

const BROWSE_OFFLINE_SNOOZE_MS = 2 * 60 * 1000;

export const MaintenanceGate = () => {
  const info = useMaintenanceStore((state) => state.info);
  const snooze = useMaintenanceStore((state) => state.snooze);
  const queryClient = useQueryClient();
  const { isAuthenticated, role } = useAuth();

  if (!info) return null;

  const openWhileWaiting = (open: () => void) => () => {
    if (!navigationRef.isReady()) return;

    snooze(BROWSE_OFFLINE_SNOOZE_MS);
    open();
  };

  const isStudent = isAuthenticated && role === 'student';

  return (
    <MaintenanceScreen
      info={info}
      savedRoomCount={queryClient.getQueryData<string[]>(FAVORITE_IDS_QUERY_KEY)?.length}
      onOpenSavedRooms={
        isStudent ? openWhileWaiting(() => navigationRef.navigate('SavedRooms')) : undefined
      }
      onOpenMessages={
        isAuthenticated
          ? openWhileWaiting(() => navigationRef.navigate('Main', { screen: 'Messages' }))
          : undefined
      }
    />
  );
};
