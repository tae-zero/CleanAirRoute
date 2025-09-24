"""
대기질 및 경로 추천 API 라우터
- FastAPI APIRouter를 사용한 엔드포인트 정의
- 요청/응답 처리 및 비즈니스 로직 호출
- 에러 처리 및 로깅
"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse

from ..domain.air_quality import (
    RouteRequest, RouteResponse, AirQualityRequest, AirQualityResponse,
    ErrorResponse, HealthCheckResponse, AirQualityService
)
from ..common.config import Settings, get_settings
from ..common.database import DatabaseSession

# 로깅 설정
logger = logging.getLogger(__name__)

# APIRouter 생성
router = APIRouter(
    prefix="/api/v1",
    tags=["air-quality"],
    responses={
        404: {"description": "Not found"},
        500: {"description": "Internal server error"}
    }
)

def get_air_quality_service(settings: Settings = Depends(get_settings)) -> AirQualityService:
    """AirQualityService 의존성 주입"""
    return AirQualityService(settings)

@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    서비스 상태 확인 엔드포인트
    """
    try:
        return HealthCheckResponse(
            status="healthy",
            version="1.0.0",
            services={
                "database": "healthy",
                "ai_prediction": "healthy",
                "route_calculation": "healthy"
            }
        )
    except Exception as e:
        logger.error(f"헬스체크 실패: {e}")
        raise HTTPException(status_code=500, detail="Service unhealthy")

@router.get("/routes", response_model=RouteResponse)
async def get_route_recommendations(
    start_lat: float = Query(..., description="출발지 위도", ge=-90, le=90),
    start_lon: float = Query(..., description="출발지 경도", ge=-180, le=180),
    end_lat: float = Query(..., description="목적지 위도", ge=-90, le=90),
    end_lon: float = Query(..., description="목적지 경도", ge=-180, le=180),
    route_types: Optional[str] = Query(
        "fastest,shortest,healthiest", 
        description="경로 타입 (쉼표로 구분)"
    ),
    departure_time: Optional[str] = Query(None, description="출발 시간 (ISO 8601 형식)"),
    air_quality_service: AirQualityService = Depends(get_air_quality_service)
):
    """
    경로 추천 API 엔드포인트
    
    Args:
        start_lat: 출발지 위도
        start_lon: 출발지 경도
        end_lat: 목적지 위도
        end_lon: 목적지 경도
        route_types: 경로 타입 (fastest, shortest, healthiest)
        departure_time: 출발 시간
        air_quality_service: 대기질 서비스 의존성
        
    Returns:
        RouteResponse: 추천 경로 정보
    """
    try:
        logger.info(f"경로 추천 요청: ({start_lat}, {start_lon}) -> ({end_lat}, {end_lon})")
        
        # 요청 데이터 생성
        request = RouteRequest(
            start_lat=start_lat,
            start_lon=start_lon,
            end_lat=end_lat,
            end_lon=end_lon,
            route_types=route_types,
            departure_time=departure_time
        )
        
        # 비즈니스 로직 실행
        response = await air_quality_service.get_recommended_routes(request)
        
        if not response.success:
            logger.warning(f"경로 추천 실패: {response.message}")
            raise HTTPException(status_code=400, detail=response.message)
        
        logger.info(f"경로 추천 성공: {response.total_routes}개 경로 생성")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"경로 추천 API 오류: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/routes", response_model=RouteResponse)
async def calculate_routes_post(
    request: RouteRequest,
    air_quality_service: AirQualityService = Depends(get_air_quality_service)
):
    """
    경로 계산 API 엔드포인트 (POST 방식)
    
    Args:
        request: 경로 요청 데이터
        air_quality_service: 대기질 서비스 의존성
        
    Returns:
        RouteResponse: 추천 경로 정보
    """
    try:
        logger.info(f"경로 계산 요청: ({request.start_lat}, {request.start_lon}) -> ({request.end_lat}, {request.end_lon})")
        
        # 비즈니스 로직 실행
        response = await air_quality_service.get_recommended_routes(request)
        
        if not response.success:
            logger.warning(f"경로 계산 실패: {response.message}")
            raise HTTPException(status_code=400, detail=response.message)
        
        logger.info(f"경로 계산 성공: {response.total_routes}개 경로 생성")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"경로 계산 API 오류: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/air-quality/current")
async def get_current_air_quality(
    latitude: float = Query(..., description="위도", ge=-90, le=90),
    longitude: float = Query(..., description="경도", ge=-180, le=180),
    radius: int = Query(5, description="반경 (km)", ge=1, le=50)
):
    """
    현재 대기질 조회 API 엔드포인트
    
    Args:
        latitude: 위도
        longitude: 경도
        radius: 반경 (km)
        
    Returns:
        현재 대기질 정보
    """
    try:
        logger.info(f"현재 대기질 조회: ({latitude}, {longitude}), 반경: {radius}km")
        
        # TODO: 실제 대기질 데이터 조회 로직 구현
        # 현재는 더미 데이터 반환
        return {
            "success": True,
            "data": {
                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                    "district": "중구"
                },
                "air_quality": {
                    "pm25": 25.5,
                    "pm10": 45.2,
                    "o3": 0.045,
                    "no2": 0.025,
                    "co": 0.8,
                    "so2": 0.005
                },
                "air_quality_index": 75,
                "grade": "moderate",
                "measured_at": "2024-12-19T10:00:00Z",
                "station_info": {
                    "station_id": "111121",
                    "station_name": "중구 측정소",
                    "distance": 1.2
                }
            },
            "message": "Current air quality data retrieved"
        }
        
    except Exception as e:
        logger.error(f"현재 대기질 조회 오류: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/air-quality/forecast")
async def get_air_quality_forecast(
    latitude: float = Query(..., description="위도", ge=-90, le=90),
    longitude: float = Query(..., description="경도", ge=-180, le=180),
    horizon: int = Query(72, description="예측 시간 (시간)", ge=1, le=168)
):
    """
    대기질 예측 조회 API 엔드포인트
    
    Args:
        latitude: 위도
        longitude: 경도
        horizon: 예측 시간 (시간)
        
    Returns:
        대기질 예측 정보
    """
    try:
        logger.info(f"대기질 예측 조회: ({latitude}, {longitude}), 예측 시간: {horizon}시간")
        
        # TODO: 실제 대기질 예측 로직 구현
        # 현재는 더미 데이터 반환
        return {
            "success": True,
            "data": {
                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                    "district": "중구"
                },
                "forecasts": [
                    {
                        "timestamp": "2024-12-19T11:00:00Z",
                        "pm25": 28.3,
                        "pm10": 48.1,
                        "o3": 0.052,
                        "no2": 0.028,
                        "air_quality_index": 82,
                        "grade": "moderate",
                        "confidence": 0.85
                    }
                ],
                "model_info": {
                    "model_version": "v1.2.0",
                    "last_updated": "2024-12-19T09:00:00Z"
                }
            },
            "message": "Air quality forecast retrieved"
        }
        
    except Exception as e:
        logger.error(f"대기질 예측 조회 오류: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/air-quality/heatmap")
async def get_air_quality_heatmap(
    bounds: str = Query(..., description="지도 경계 (sw_lat,sw_lng,ne_lat,ne_lng)"),
    timestamp: Optional[str] = Query(None, description="특정 시간 (ISO 8601 형식)"),
    pollutant: str = Query("pm25", description="오염물질 (pm25, pm10, o3, no2)")
):
    """
    대기질 히트맵 데이터 조회 API 엔드포인트
    
    Args:
        bounds: 지도 경계
        timestamp: 특정 시간
        pollutant: 오염물질 타입
        
    Returns:
        히트맵 데이터
    """
    try:
        logger.info(f"대기질 히트맵 조회: bounds={bounds}, pollutant={pollutant}")
        
        # TODO: 실제 히트맵 데이터 조회 로직 구현
        # 현재는 더미 데이터 반환
        return {
            "success": True,
            "data": {
                "timestamp": "2024-12-19T10:00:00Z",
                "pollutant": pollutant,
                "heatmap_data": [
                    {
                        "latitude": 37.5665,
                        "longitude": 126.9780,
                        "intensity": 25.5,
                        "grade": "moderate"
                    }
                ],
                "color_scale": {
                    "good": "#00E400",
                    "moderate": "#FFFF00",
                    "unhealthy": "#FF7E00",
                    "very_unhealthy": "#FF0000",
                    "hazardous": "#8F3F97"
                }
            },
            "message": "Heatmap data retrieved"
        }
        
    except Exception as e:
        logger.error(f"대기질 히트맵 조회 오류: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# 에러 핸들러
@router.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """HTTP 예외 처리"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            message=exc.detail,
            error_code=f"HTTP_{exc.status_code}",
            details={"path": str(request.url)}
        ).dict()
    )

@router.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """일반 예외 처리"""
    logger.error(f"예상치 못한 오류 발생: {exc}")
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            message="Internal server error",
            error_code="INTERNAL_ERROR",
            details={"path": str(request.url)}
        ).dict()
    )
