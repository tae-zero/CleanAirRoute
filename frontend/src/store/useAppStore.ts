import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AppState } from '@/types';

interface AppStore extends AppState {
  // Additional state
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;
  
  // Actions
  setCurrentTime: (time: Date) => void;
  setSelectedTime: (time: Date | undefined) => void;
  setLoading: (isLoading: boolean) => void;
  addNotification: (notification: Omit<AppStore['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  updateAppState: (state: Partial<AppState>) => void;
}

const initialState: AppState = {
  currentTime: new Date(),
  selectedTime: undefined,
  isLoading: false,
  map: {
    center: { latitude: 37.5665, longitude: 126.9780 },
    zoom: 8,
    bounds: '',
    selectedRouteId: undefined,
    showHeatmap: true,
    showRoutes: true,
  },
  search: {
    startLocation: undefined,
    endLocation: undefined,
    isSearching: false,
    searchResults: undefined,
    error: undefined,
  },
};

export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      notifications: [],

      setCurrentTime: (currentTime) =>
        set(
          { currentTime },
          false,
          'app/setCurrentTime'
        ),

      setSelectedTime: (selectedTime) =>
        set(
          { selectedTime },
          false,
          'app/setSelectedTime'
        ),

      setLoading: (isLoading) =>
        set(
          { isLoading },
          false,
          'app/setLoading'
        ),

      addNotification: (notification) =>
        set(
          (state) => ({
            notifications: [
              {
                ...notification,
                id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(),
                read: false,
              },
              ...state.notifications,
            ].slice(0, 50), // 최대 50개 알림 유지
          }),
          false,
          'app/addNotification'
        ),

      removeNotification: (id) =>
        set(
          (state) => ({
            notifications: state.notifications.filter(n => n.id !== id),
          }),
          false,
          'app/removeNotification'
        ),

      markNotificationAsRead: (id) =>
        set(
          (state) => ({
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            ),
          }),
          false,
          'app/markNotificationAsRead'
        ),

      clearNotifications: () =>
        set(
          { notifications: [] },
          false,
          'app/clearNotifications'
        ),

      updateAppState: (newState) =>
        set(
          (state) => ({ ...state, ...newState }),
          false,
          'app/updateAppState'
        ),
    }),
    {
      name: 'AppStore',
    }
  )
);

// Selectors
export const selectCurrentTime = (state: AppStore) => state.currentTime;
export const selectSelectedTime = (state: AppStore) => state.selectedTime;
export const selectIsLoading = (state: AppStore) => state.isLoading;
export const selectNotifications = (state: AppStore) => state.notifications;
export const selectUnreadNotifications = (state: AppStore) => 
  state.notifications.filter(n => !n.read);
export const selectUnreadNotificationCount = (state: AppStore) => 
  state.notifications.filter(n => !n.read).length;
export const selectAppState = (state: AppStore) => ({
  currentTime: state.currentTime,
  selectedTime: state.selectedTime,
  isLoading: state.isLoading,
  map: state.map,
  search: state.search,
});

// Computed selectors
export const selectHasNotifications = (state: AppStore) => 
  state.notifications.length > 0;

export const selectHasUnreadNotifications = (state: AppStore) => 
  state.notifications.some(n => !n.read);

export const selectNotificationsByType = (type: 'success' | 'error' | 'warning' | 'info') => 
  (state: AppStore) => state.notifications.filter(n => n.type === type);
