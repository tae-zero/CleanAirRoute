"""
대기질 도메인 모듈
- 대기질 및 경로 추천 관련 비즈니스 로직
- 스키마, 서비스, 모델 정의
"""

from .air_quality_schema import (
    RouteRequest, RouteResponse, RouteInfo, RouteSegment,
    Coordinate, AirQualityData, AirQualityRequest, AirQualityResponse,
    ErrorResponse, HealthCheckResponse
)
from .air_quality_service import AirQualityService

__all__ = [
    "RouteRequest", "RouteResponse", "RouteInfo", "RouteSegment",
    "Coordinate", "AirQualityData", "AirQualityRequest", "AirQualityResponse",
    "ErrorResponse", "HealthCheckResponse", "AirQualityService"
]
