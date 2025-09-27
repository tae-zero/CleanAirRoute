import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { DEFAULT_SETTINGS } from '@/utils/constants';
import type { UserPreferences, AppSettings } from '@/types';

interface UserStore {
  // User preferences
  preferences: UserPreferences;
  
  // App settings
  settings: AppSettings;
  
  // User state
  isAuthenticated: boolean;
  userId?: string;
  userName?: string;
  userEmail?: string;
  
  // Actions
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setUser: (user: { id: string; name: string; email: string }) => void;
  clearUser: () => void;
  resetPreferences: () => void;
  resetSettings: () => void;
  toggleTheme: () => void;
  toggleNotifications: () => void;
  toggleAutoRefresh: () => void;
  setRefreshInterval: (interval: number) => void;
  setLanguage: (language: 'ko' | 'en') => void;
  setDefaultRouteType: (routeType: 'fastest' | 'shortest' | 'healthiest') => void;
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set, get) => ({
        preferences: DEFAULT_SETTINGS.USER,
        settings: {
          user: DEFAULT_SETTINGS.USER,
          map: DEFAULT_SETTINGS.MAP,
          notifications: DEFAULT_SETTINGS.NOTIFICATIONS,
        },
        isAuthenticated: false,
        userId: undefined,
        userName: undefined,
        userEmail: undefined,

        updatePreferences: (newPreferences) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, ...newPreferences },
              settings: {
                ...state.settings,
                user: { ...state.settings.user, ...newPreferences },
              },
            }),
            false,
            'user/updatePreferences'
          ),

        updateSettings: (newSettings) =>
          set(
            (state) => ({
              settings: { ...state.settings, ...newSettings },
            }),
            false,
            'user/updateSettings'
          ),

        setUser: (user) =>
          set(
            {
              isAuthenticated: true,
              userId: user.id,
              userName: user.name,
              userEmail: user.email,
            },
            false,
            'user/setUser'
          ),

        clearUser: () =>
          set(
            {
              isAuthenticated: false,
              userId: undefined,
              userName: undefined,
              userEmail: undefined,
            },
            false,
            'user/clearUser'
          ),

        resetPreferences: () =>
          set(
            (state) => ({
              preferences: DEFAULT_SETTINGS.USER,
              settings: {
                ...state.settings,
                user: DEFAULT_SETTINGS.USER,
              },
            }),
            false,
            'user/resetPreferences'
          ),

        resetSettings: () =>
          set(
            {
              preferences: DEFAULT_SETTINGS.USER,
              settings: {
                user: DEFAULT_SETTINGS.USER,
                map: DEFAULT_SETTINGS.MAP,
                notifications: DEFAULT_SETTINGS.NOTIFICATIONS,
              },
            },
            false,
            'user/resetSettings'
          ),

        toggleTheme: () =>
          set(
            (state) => {
              const currentTheme = state.preferences.theme;
              const newTheme = currentTheme === 'light' ? 'dark' : 'light';
              return {
                preferences: { ...state.preferences, theme: newTheme },
                settings: {
                  ...state.settings,
                  user: { ...state.settings.user, theme: newTheme },
                },
              };
            },
            false,
            'user/toggleTheme'
          ),

        toggleNotifications: () =>
          set(
            (state) => ({
              preferences: { ...state.preferences, showNotifications: !state.preferences.showNotifications },
              settings: {
                ...state.settings,
                user: { ...state.settings.user, showNotifications: !state.settings.user.showNotifications },
              },
            }),
            false,
            'user/toggleNotifications'
          ),

        toggleAutoRefresh: () =>
          set(
            (state) => ({
              preferences: { ...state.preferences, autoRefresh: !state.preferences.autoRefresh },
              settings: {
                ...state.settings,
                user: { ...state.settings.user, autoRefresh: !state.settings.user.autoRefresh },
              },
            }),
            false,
            'user/toggleAutoRefresh'
          ),

        setRefreshInterval: (interval) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, refreshInterval: interval },
              settings: {
                ...state.settings,
                user: { ...state.settings.user, refreshInterval: interval },
              },
            }),
            false,
            'user/setRefreshInterval'
          ),

        setLanguage: (language) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, language },
              settings: {
                ...state.settings,
                user: { ...state.settings.user, language },
              },
            }),
            false,
            'user/setLanguage'
          ),

        setDefaultRouteType: (routeType) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, defaultRouteType: routeType },
              settings: {
                ...state.settings,
                user: { ...state.settings.user, defaultRouteType: routeType },
              },
            }),
            false,
            'user/setDefaultRouteType'
          ),
      }),
      {
        name: 'user-store',
        partialize: (state) => ({
          preferences: state.preferences,
          settings: state.settings,
        }),
      }
    ),
    {
      name: 'UserStore',
    }
  )
);

// Selectors
export const selectUserPreferences = (state: UserStore) => state.preferences;
export const selectAppSettings = (state: UserStore) => state.settings;
export const selectIsAuthenticated = (state: UserStore) => state.isAuthenticated;
export const selectUser = (state: UserStore) => ({
  id: state.userId,
  name: state.userName,
  email: state.userEmail,
});
export const selectTheme = (state: UserStore) => state.preferences.theme;
export const selectLanguage = (state: UserStore) => state.preferences.language;
export const selectDefaultRouteType = (state: UserStore) => state.preferences.defaultRouteType;
export const selectShowNotifications = (state: UserStore) => state.preferences.showNotifications;
export const selectAutoRefresh = (state: UserStore) => state.preferences.autoRefresh;
export const selectRefreshInterval = (state: UserStore) => state.preferences.refreshInterval;
