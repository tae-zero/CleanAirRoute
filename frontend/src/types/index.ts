// 공통 타입 정의
export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Location {
  name: string;
  address: string;
  coordinate: Coordinate;
}

// 대기질 관련 타입
export interface AirQualityData {
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  co: number;
  so2: number;
  air_quality_index: number;
  grade: 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
  measured_at: string;
}

export interface AirQualityStation {
  station_id: string;
  station_name: string;
  coordinate: Coordinate;
  distance: number;
}

export interface AirQualityResponse {
  location: Coordinate;
  air_quality: AirQualityData;
  station_info: AirQualityStation;
}

// 경로 관련 타입
export interface RouteSegment {
  start: Coordinate;
  end: Coordinate;
  distance: number;
  duration: number;
  air_quality: AirQualityData;
  instructions: string;
}

export interface RouteSummary {
  duration: number;
  distance: number;
  air_quality_score: number;
  pollution_exposure: {
    pm25: number;
    pm10: number;
    o3: number;
  };
}

export interface RouteInfo {
  route_id: string;
  type: 'fastest' | 'shortest' | 'healthiest';
  summary: RouteSummary;
  waypoints: Coordinate[];
  segments: RouteSegment[];
  polyline: string;
}

export interface RouteRequest {
  start: Coordinate;
  end: Coordinate;
  route_types?: string[];
  preferences?: {
    max_duration?: number;
    max_distance?: number;
    min_air_quality_score?: number;
  };
}

// 히트맵 관련 타입
export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  intensity: number;
  grade: string;
  timestamp: string;
}

export interface HeatmapData {
  timestamp: string;
  pollutant: string;
  heatmap_data: HeatmapPoint[];
  color_scale: {
    good: string;
    moderate: string;
    unhealthy: string;
    very_unhealthy: string;
    hazardous: string;
  };
}

// 예측 관련 타입
export interface ForecastData {
  timestamp: string;
  air_quality: AirQualityData;
  weather: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    precipitation: number;
  };
  confidence: number;
}

export interface ForecastResponse {
  location: Coordinate;
  forecasts: ForecastData[];
  model_info: {
    model_name: string;
    version: string;
    accuracy: number;
  };
}

// UI 상태 관련 타입
export interface MapState {
  center: Coordinate;
  zoom: number;
  bounds: string;
  selectedRouteId?: string;
  showHeatmap: boolean;
  showRoutes: boolean;
}

export interface SearchState {
  startLocation?: Location;
  endLocation?: Location;
  isSearching: boolean;
  searchResults?: RouteInfo[];
  error?: string;
}

export interface AppState {
  map: MapState;
  search: SearchState;
  currentTime: Date;
  selectedTime?: Date;
  isLoading: boolean;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    details: string;
  };
  timestamp: string;
}

// 컴포넌트 Props 타입
export interface MapComponentProps {
  center: Coordinate;
  zoom?: number;
  routes?: RouteInfo[];
  selectedRouteId?: string;
  onRouteSelect?: (routeId: string) => void;
  onMapClick?: (coordinate: Coordinate) => void;
  showHeatmap?: boolean;
  showRoutes?: boolean;
  isLoading?: boolean;
}

export interface RouteCardProps {
  route: RouteInfo;
  isSelected: boolean;
  onSelect: (routeId: string) => void;
  onCompare?: (routeId: string) => void;
}

export interface AirQualityCardProps {
  data: AirQualityData;
  location: string;
  timestamp: string;
  showDetails?: boolean;
}

export interface ChartProps {
  data: any[];
  type: 'line' | 'bar' | 'area' | 'doughnut';
  options?: any;
  height?: number;
  width?: number;
}

// 폼 관련 타입
export interface SearchFormData {
  startAddress: string;
  endAddress: string;
  startCoordinate?: Coordinate;
  endCoordinate?: Coordinate;
  routeTypes: string[];
  preferences: {
    maxDuration: number;
    maxDistance: number;
    minAirQualityScore: number;
  };
}

// 설정 관련 타입
export interface UserPreferences {
  defaultRouteType: 'fastest' | 'shortest' | 'healthiest';
  showNotifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
}

export interface AppSettings {
  user: UserPreferences;
  map: {
    defaultZoom: number;
    defaultCenter: Coordinate;
    showTraffic: boolean;
    showTransit: boolean;
  };
  notifications: {
    airQualityAlerts: boolean;
    routeUpdates: boolean;
    systemUpdates: boolean;
  };
}
