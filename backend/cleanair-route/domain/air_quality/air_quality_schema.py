"""
대기질 및 경로 추천 관련 Pydantic 스키마
- API 요청/응답 데이터 모델 정의
- 데이터 유효성 검증 및 직렬화
- 타입 안전성 보장
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime

class Coordinate(BaseModel):
    """좌표 모델"""
    latitude: float = Field(..., ge=-90, le=90, description="위도 (-90 ~ 90)")
    longitude: float = Field(..., ge=-180, le=180, description="경도 (-180 ~ 180)")

class RouteRequest(BaseModel):
    """경로 추천 API 요청 스키마"""
    start_lat: float = Field(..., ge=-90, le=90, description="출발지 위도")
    start_lon: float = Field(..., ge=-180, le=180, description="출발지 경도")
    end_lat: float = Field(..., ge=-90, le=90, description="목적지 위도")
    end_lon: float = Field(..., ge=-180, le=180, description="목적지 경도")
    route_types: Optional[str] = Field(
        "fastest,shortest,healthiest", 
        description="경로 타입 (쉼표로 구분)"
    )
    departure_time: Optional[datetime] = Field(None, description="출발 시간")
    
    @validator('route_types')
    def validate_route_types(cls, v):
        """경로 타입 유효성 검증"""
        if v:
            valid_types = ['fastest', 'shortest', 'healthiest']
            types = [t.strip() for t in v.split(',')]
            for route_type in types:
                if route_type not in valid_types:
                    raise ValueError(f"Invalid route type: {route_type}")
        return v

class AirQualityData(BaseModel):
    """대기질 데이터 모델"""
    pm25: float = Field(..., ge=0, description="PM2.5 농도 (μg/m³)")
    pm10: float = Field(..., ge=0, description="PM10 농도 (μg/m³)")
    o3: float = Field(..., ge=0, description="오존 농도 (ppm)")
    no2: float = Field(..., ge=0, description="이산화질소 농도 (ppm)")
    air_quality_index: int = Field(..., ge=0, le=500, description="대기질 지수")
    grade: str = Field(..., description="대기질 등급")
    confidence: float = Field(..., ge=0, le=1, description="예측 신뢰도")

class RouteSegment(BaseModel):
    """경로 구간 모델"""
    start: Coordinate
    end: Coordinate
    distance: float = Field(..., ge=0, description="구간 거리 (km)")
    duration: int = Field(..., ge=0, description="구간 소요시간 (분)")
    air_quality: AirQualityData
    instructions: str = Field(..., description="이동 안내")

class RouteInfo(BaseModel):
    """경로 정보 모델"""
    route_id: str = Field(..., description="경로 고유 ID")
    type: str = Field(..., description="경로 타입")
    travel_time_minutes: int = Field(..., ge=0, description="총 소요시간 (분)")
    distance_km: float = Field(..., ge=0, description="총 거리 (km)")
    average_aqi: float = Field(..., ge=0, le=500, description="평균 대기질 지수")
    air_quality_score: float = Field(..., ge=0, le=100, description="대기질 점수 (0-100)")
    pollution_exposure: Dict[str, float] = Field(..., description="오염물질 노출량")
    waypoints: List[Coordinate] = Field(..., description="경로 좌표점들")
    segments: List[RouteSegment] = Field(..., description="경로 구간들")
    polyline: str = Field(..., description="폴리라인 인코딩 문자열")
    
    @validator('type')
    def validate_route_type(cls, v):
        """경로 타입 유효성 검증"""
        valid_types = ['fastest', 'shortest', 'healthiest', 'optimal']
        if v not in valid_types:
            raise ValueError(f"Invalid route type: {v}")
        return v

class RouteResponse(BaseModel):
    """경로 추천 API 응답 스키마"""
    success: bool = Field(True, description="요청 성공 여부")
    message: str = Field(..., description="응답 메시지")
    fastest_route: Optional[RouteInfo] = Field(None, description="가장 빠른 경로")
    shortest_route: Optional[RouteInfo] = Field(None, description="가장 짧은 경로")
    healthiest_route: Optional[RouteInfo] = Field(None, description="가장 건강한 경로")
    optimal_route: Optional[RouteInfo] = Field(None, description="최적 경로")
    calculation_time: datetime = Field(default_factory=datetime.now, description="계산 시간")
    total_routes: int = Field(..., ge=0, description="총 경로 수")

class AirQualityRequest(BaseModel):
    """대기질 예측 요청 스키마"""
    latitude: float = Field(..., ge=-90, le=90, description="위도")
    longitude: float = Field(..., ge=-180, le=180, description="경도")
    prediction_hours: int = Field(24, ge=1, le=72, description="예측 시간 (시간)")
    current_weather: Optional[Dict[str, Any]] = Field(None, description="현재 기상 조건")

class AirQualityPrediction(BaseModel):
    """대기질 예측 결과 모델"""
    hour: int = Field(..., ge=1, description="예측 시간 (시간)")
    predicted_pm25: float = Field(..., ge=0, description="예측 PM2.5 농도")
    predicted_pm10: float = Field(..., ge=0, description="예측 PM10 농도")
    predicted_o3: float = Field(..., ge=0, description="예측 오존 농도")
    predicted_no2: float = Field(..., ge=0, description="예측 이산화질소 농도")
    air_quality_index: int = Field(..., ge=0, le=500, description="예측 대기질 지수")
    grade: str = Field(..., description="예측 대기질 등급")
    confidence: float = Field(..., ge=0, le=1, description="예측 신뢰도")
    prediction_time: datetime = Field(..., description="예측 시간")

class AirQualityResponse(BaseModel):
    """대기질 예측 API 응답 스키마"""
    success: bool = Field(True, description="요청 성공 여부")
    message: str = Field(..., description="응답 메시지")
    predictions: List[AirQualityPrediction] = Field(..., description="예측 결과 목록")
    confidence: float = Field(..., ge=0, le=1, description="전체 신뢰도")
    model_version: str = Field(..., description="모델 버전")
    prediction_time: datetime = Field(default_factory=datetime.now, description="예측 수행 시간")

class ErrorResponse(BaseModel):
    """에러 응답 스키마"""
    success: bool = Field(False, description="요청 실패")
    message: str = Field(..., description="에러 메시지")
    error_code: str = Field(..., description="에러 코드")
    details: Optional[Dict[str, Any]] = Field(None, description="상세 에러 정보")
    timestamp: datetime = Field(default_factory=datetime.now, description="에러 발생 시간")

class HealthCheckResponse(BaseModel):
    """헬스체크 응답 스키마"""
    status: str = Field(..., description="서비스 상태")
    timestamp: datetime = Field(default_factory=datetime.now, description="체크 시간")
    version: str = Field(..., description="서비스 버전")
    services: Dict[str, str] = Field(..., description="하위 서비스 상태")
