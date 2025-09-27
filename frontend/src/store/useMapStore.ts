import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { MAP_DEFAULTS } from '@/utils/constants';
import type { Coordinate, MapState } from '@/types';

interface MapStore extends MapState {
  // Actions
  setCenter: (center: Coordinate) => void;
  setZoom: (zoom: number) => void;
  setBounds: (bounds: string) => void;
  setSelectedRouteId: (routeId: string | undefined) => void;
  toggleHeatmap: () => void;
  toggleRoutes: () => void;
  resetMap: () => void;
  updateMapState: (state: Partial<MapState>) => void;
}

const initialState: MapState = {
  center: MAP_DEFAULTS.CENTER,
  zoom: MAP_DEFAULTS.ZOOM,
  bounds: '',
  selectedRouteId: undefined,
  showHeatmap: true,
  showRoutes: true,
};

export const useMapStore = create<MapStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setCenter: (center) =>
          set(
            { center },
            false,
            'map/setCenter'
          ),

        setZoom: (zoom) =>
          set(
            { zoom },
            false,
            'map/setZoom'
          ),

        setBounds: (bounds) =>
          set(
            { bounds },
            false,
            'map/setBounds'
          ),

        setSelectedRouteId: (selectedRouteId) =>
          set(
            { selectedRouteId },
            false,
            'map/setSelectedRouteId'
          ),

        toggleHeatmap: () =>
          set(
            (state) => ({ showHeatmap: !state.showHeatmap }),
            false,
            'map/toggleHeatmap'
          ),

        toggleRoutes: () =>
          set(
            (state) => ({ showRoutes: !state.showRoutes }),
            false,
            'map/toggleRoutes'
          ),

        resetMap: () =>
          set(
            initialState,
            false,
            'map/resetMap'
          ),

        updateMapState: (newState) =>
          set(
            (state) => ({ ...state, ...newState }),
            false,
            'map/updateMapState'
          ),
      }),
      {
        name: 'map-store',
        partialize: (state) => ({
          center: state.center,
          zoom: state.zoom,
          showHeatmap: state.showHeatmap,
          showRoutes: state.showRoutes,
        }),
      }
    ),
    {
      name: 'MapStore',
    }
  )
);

// Selectors
export const selectMapCenter = (state: MapStore) => state.center;
export const selectMapZoom = (state: MapStore) => state.zoom;
export const selectMapBounds = (state: MapStore) => state.bounds;
export const selectSelectedRouteId = (state: MapStore) => state.selectedRouteId;
export const selectShowHeatmap = (state: MapStore) => state.showHeatmap;
export const selectShowRoutes = (state: MapStore) => state.showRoutes;
export const selectMapState = (state: MapStore) => ({
  center: state.center,
  zoom: state.zoom,
  bounds: state.bounds,
  selectedRouteId: state.selectedRouteId,
  showHeatmap: state.showHeatmap,
  showRoutes: state.showRoutes,
});
