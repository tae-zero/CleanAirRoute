import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { RouteInfo, SearchState, Location, Coordinate } from '@/types';

interface RouteStore extends SearchState {
  // Additional state
  searchHistory: RouteInfo[];
  favoriteRoutes: RouteInfo[];
  recentSearches: Array<{
    start: Location;
    end: Location;
    timestamp: Date;
  }>;
  
  // Actions
  setStartLocation: (location: Location | undefined) => void;
  setEndLocation: (location: Location | undefined) => void;
  setSearching: (isSearching: boolean) => void;
  setSearchResults: (results: RouteInfo[] | undefined) => void;
  setError: (error: string | undefined) => void;
  clearSearch: () => void;
  addToHistory: (route: RouteInfo) => void;
  addToFavorites: (route: RouteInfo) => void;
  removeFromFavorites: (routeId: string) => void;
  addRecentSearch: (start: Location, end: Location) => void;
  clearHistory: () => void;
  clearRecentSearches: () => void;
  updateSearchState: (state: Partial<SearchState>) => void;
}

const initialState: SearchState = {
  startLocation: undefined,
  endLocation: undefined,
  isSearching: false,
  searchResults: undefined,
  error: undefined,
};

export const useRouteStore = create<RouteStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      searchHistory: [],
      favoriteRoutes: [],
      recentSearches: [],

      setStartLocation: (startLocation) =>
        set(
          { startLocation },
          false,
          'route/setStartLocation'
        ),

      setEndLocation: (endLocation) =>
        set(
          { endLocation },
          false,
          'route/setEndLocation'
        ),

      setSearching: (isSearching) =>
        set(
          { isSearching },
          false,
          'route/setSearching'
        ),

      setSearchResults: (searchResults) =>
        set(
          { searchResults, error: undefined },
          false,
          'route/setSearchResults'
        ),

      setError: (error) =>
        set(
          { error, isSearching: false },
          false,
          'route/setError'
        ),

      clearSearch: () =>
        set(
          {
            isSearching: false,
            searchResults: undefined,
            error: undefined,
          },
          false,
          'route/clearSearch'
        ),

      addToHistory: (route) =>
        set(
          (state) => ({
            searchHistory: [route, ...state.searchHistory.filter(r => r.route_id !== route.route_id)].slice(0, 50),
          }),
          false,
          'route/addToHistory'
        ),

      addToFavorites: (route) =>
        set(
          (state) => ({
            favoriteRoutes: [...state.favoriteRoutes.filter(r => r.route_id !== route.route_id), route],
          }),
          false,
          'route/addToFavorites'
        ),

      removeFromFavorites: (routeId) =>
        set(
          (state) => ({
            favoriteRoutes: state.favoriteRoutes.filter(r => r.route_id !== routeId),
          }),
          false,
          'route/removeFromFavorites'
        ),

      addRecentSearch: (start, end) =>
        set(
          (state) => ({
            recentSearches: [
              { start, end, timestamp: new Date() },
              ...state.recentSearches.filter(
                search => 
                  !(search.start.coordinate.latitude === start.coordinate.latitude &&
                    search.start.coordinate.longitude === start.coordinate.longitude &&
                    search.end.coordinate.latitude === end.coordinate.latitude &&
                    search.end.coordinate.longitude === end.coordinate.longitude)
              )
            ].slice(0, 20),
          }),
          false,
          'route/addRecentSearch'
        ),

      clearHistory: () =>
        set(
          { searchHistory: [] },
          false,
          'route/clearHistory'
        ),

      clearRecentSearches: () =>
        set(
          { recentSearches: [] },
          false,
          'route/clearRecentSearches'
        ),

      updateSearchState: (newState) =>
        set(
          (state) => ({ ...state, ...newState }),
          false,
          'route/updateSearchState'
        ),
    }),
    {
      name: 'RouteStore',
    }
  )
);

// Selectors
export const selectStartLocation = (state: RouteStore) => state.startLocation;
export const selectEndLocation = (state: RouteStore) => state.endLocation;
export const selectIsSearching = (state: RouteStore) => state.isSearching;
export const selectSearchResults = (state: RouteStore) => state.searchResults;
export const selectSearchError = (state: RouteStore) => state.error;
export const selectSearchHistory = (state: RouteStore) => state.searchHistory;
export const selectFavoriteRoutes = (state: RouteStore) => state.favoriteRoutes;
export const selectRecentSearches = (state: RouteStore) => state.recentSearches;
export const selectSearchState = (state: RouteStore) => ({
  startLocation: state.startLocation,
  endLocation: state.endLocation,
  isSearching: state.isSearching,
  searchResults: state.searchResults,
  error: state.error,
});

// Computed selectors
export const selectHasValidSearch = (state: RouteStore) => 
  state.startLocation && state.endLocation;

export const selectSearchResultsCount = (state: RouteStore) => 
  state.searchResults?.length || 0;

export const selectIsRouteFavorited = (routeId: string) => (state: RouteStore) =>
  state.favoriteRoutes.some(route => route.route_id === routeId);
