'use client';

import React from 'react';
import { Card, Badge, Icon } from '@/components/atoms';
import { 
  AIR_QUALITY_COLORS, 
  AIR_QUALITY_LABELS 
} from '@/utils/constants';
import { formatRelativeTime, calculateAirQualityScore } from '@/utils/helpers';
import { cn } from '@/utils/helpers';
import type { AirQualityCardProps } from '@/types';

export default function AirQualityCard({
  data,
  location,
  timestamp,
  showDetails = false,
  className,
}: AirQualityCardProps & { className?: string }) {
  const airQualityScore = calculateAirQualityScore(data);
  const gradeColor = AIR_QUALITY_COLORS[data.grade];
  const gradeLabel = AIR_QUALITY_LABELS[data.grade];

  // 대기질 등급별 아이콘
  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'good':
        return <Icon name="check" size="md" className="text-green-500" />;
      case 'moderate':
        return <Icon name="info" size="md" className="text-yellow-500" />;
      case 'unhealthy':
      case 'very_unhealthy':
      case 'hazardous':
        return <Icon name="warning" size="md" className="text-red-500" />;
      default:
        return <Icon name="info" size="md" className="text-gray-500" />;
    }
  };

  // 대기질 등급별 배경색
  const getGradeBackgroundColor = (grade: string) => {
    switch (grade) {
      case 'good':
        return 'bg-green-50 border-green-200';
      case 'moderate':
        return 'bg-yellow-50 border-yellow-200';
      case 'unhealthy':
        return 'bg-orange-50 border-orange-200';
      case 'very_unhealthy':
        return 'bg-red-50 border-red-200';
      case 'hazardous':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card 
      className={cn(getGradeBackgroundColor(data.grade), className)}
      variant="outlined"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getGradeIcon(data.grade)}
          <div>
            <h3 className="font-semibold text-gray-900">{location}</h3>
            <p className="text-sm text-gray-500">
              {formatRelativeTime(timestamp)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div 
            className="text-2xl font-bold"
            style={{ color: gradeColor }}
          >
            {data.air_quality_index}
          </div>
          <Badge variant="default" size="sm">
            {gradeLabel}
          </Badge>
        </div>
      </div>

      {/* 대기질 점수 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">대기질 점수</span>
          <span className="text-sm font-semibold">{airQualityScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              backgroundColor: gradeColor,
              width: `${airQualityScore}%`
            }}
          />
        </div>
      </div>

      {/* 주요 오염물질 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 bg-white rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {data.pm25.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">PM2.5</div>
          <div className="text-xs text-gray-400">μg/m³</div>
        </div>
        <div className="text-center p-2 bg-white rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {data.pm10.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">PM10</div>
          <div className="text-xs text-gray-400">μg/m³</div>
        </div>
        <div className="text-center p-2 bg-white rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {data.o3.toFixed(3)}
          </div>
          <div className="text-xs text-gray-500">O₃</div>
          <div className="text-xs text-gray-400">ppm</div>
        </div>
        <div className="text-center p-2 bg-white rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {data.no2.toFixed(3)}
          </div>
          <div className="text-xs text-gray-500">NO₂</div>
          <div className="text-xs text-gray-400">ppm</div>
        </div>
      </div>

      {/* 상세 정보 */}
      {showDetails && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">CO:</span>
            <span className="font-medium">{data.co.toFixed(1)} ppm</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">SO₂:</span>
            <span className="font-medium">{data.so2.toFixed(3)} ppm</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">측정 시간:</span>
            <span className="font-medium">
              {new Date(timestamp).toLocaleString('ko-KR')}
            </span>
          </div>
        </div>
      )}

      {/* 건강 권고사항 */}
      <div className="mt-4 p-3 bg-white rounded-lg border-l-4" style={{ borderLeftColor: gradeColor }}>
        <div className="text-sm">
          <div className="font-medium text-gray-900 mb-1">건강 권고사항</div>
          <div className="text-gray-600">
            {data.grade === 'good' && '야외 활동에 적합합니다.'}
            {data.grade === 'moderate' && '일반인은 야외 활동이 가능합니다.'}
            {data.grade === 'unhealthy' && '민감한 분들은 야외 활동을 제한하세요.'}
            {data.grade === 'very_unhealthy' && '야외 활동을 피하고 마스크를 착용하세요.'}
            {data.grade === 'hazardous' && '외출을 피하고 실내에 머물러주세요.'}
          </div>
        </div>
      </div>
    </Card>
  );
}
