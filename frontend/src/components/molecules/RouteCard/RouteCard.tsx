'use client';

import React from 'react';
import { Card, Badge, Icon } from '@/components/atoms';
import { 
  ROUTE_TYPE_LABELS, 
  ROUTE_TYPE_COLORS, 
  ROUTE_TYPE_ICONS 
} from '@/utils/constants';
import { formatDuration, formatDistance, cn } from '@/utils/helpers';
import type { RouteInfo } from '@/types';

interface RouteCardProps {
  route: RouteInfo;
  isSelected: boolean;
  onSelect: (routeId: string) => void;
  onToggleFavorite?: (route: RouteInfo) => void;
  className?: string;
}

export default function RouteCard({
  route,
  isSelected,
  onSelect,
  onToggleFavorite,
  className,
}: RouteCardProps) {
  const routeColor = ROUTE_TYPE_COLORS[route.type];
  const routeIcon = ROUTE_TYPE_ICONS[route.type];
  const routeLabel = ROUTE_TYPE_LABELS[route.type];

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        isSelected && 'ring-2 ring-primary-500 bg-primary-50',
        className
      )}
      hover={true}
      onClick={() => onSelect(route.route_id)}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: routeColor }}
          />
          <span className="text-lg">{routeIcon}</span>
          <h3 className="font-semibold text-gray-900">{routeLabel}</h3>
        </div>
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(route);
            }}
            className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
            title="즐겨찾기"
          >
            <Icon name="star" size="sm" />
          </button>
        )}
      </div>

      {/* 주요 정보 */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Icon name="clock" size="sm" className="text-gray-400 mr-1" />
            <span className="text-sm text-gray-600">소요시간</span>
          </div>
          <div className="font-semibold text-gray-900">
            {formatDuration(route.summary.duration)}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Icon name="map" size="sm" className="text-gray-400 mr-1" />
            <span className="text-sm text-gray-600">거리</span>
          </div>
          <div className="font-semibold text-gray-900">
            {formatDistance(route.summary.distance)}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Icon name="heart" size="sm" className="text-gray-400 mr-1" />
            <span className="text-sm text-gray-600">건강점수</span>
          </div>
          <div className="font-semibold text-gray-900">
            {route.summary.air_quality_score}/100
          </div>
        </div>
      </div>

      {/* 대기질 점수 바 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">대기질 점수</span>
          <span className="text-sm font-medium">
            {route.summary.air_quality_score}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              backgroundColor: routeColor,
              width: `${route.summary.air_quality_score}%`
            }}
          />
        </div>
      </div>

      {/* 오염물질 노출량 */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="font-medium text-gray-900">
            {route.summary.pollution_exposure.pm25.toFixed(1)}
          </div>
          <div className="text-gray-500">PM2.5</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="font-medium text-gray-900">
            {route.summary.pollution_exposure.pm10.toFixed(1)}
          </div>
          <div className="text-gray-500">PM10</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="font-medium text-gray-900">
            {route.summary.pollution_exposure.o3.toFixed(3)}
          </div>
          <div className="text-gray-500">O₃</div>
        </div>
      </div>

      {/* 선택 표시 */}
      {isSelected && (
        <div className="mt-3 flex items-center justify-center text-primary-600">
          <Icon name="arrow-right" size="sm" className="mr-1" />
          <span className="text-sm font-medium">선택된 경로</span>
        </div>
      )}
    </Card>
  );
}
