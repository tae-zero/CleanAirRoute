"""
경로 및 로직 서비스 (Route Logic Service)
- API Gateway 역할
- 경로 계산 및 최적화
- 외부 지도 API 통합
- 비즈니스 로직 오케스트레이션
"""

import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Optional, Any
import math
import os

import httpx
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 초기화
app = FastAPI(
    title="Route Logic Service",
    description="경로 계산 및 최적화 서비스",
    version="1.0.0"
)

# 환경 변수
AI_PREDICTION_URL = os.getenv("AI_PREDICTION_URL", "http://localhost:8002")
KAKAO_MAPS_URL = os.getenv("KAKAO_MAPS_URL", "https://maps.api.kakao.com")

# Pydantic 모델 정의
class Coordinate(BaseModel):
    """좌표 모델"""
    latitude: float = Field(..., description="위도", ge=-90, le=90)
    longitude: float = Field(..., description="경도", ge=-180, le=180)

class RouteRequest(BaseModel):
    """경로 요청 스키마"""
    start: Coordinate = Field(..., description="출발지 좌표")
    end: Coordinate = Field(..., description="목적지 좌표")
    route_types: List[str] = Field(["fastest", "shortest", "healthiest"], description="경로 타입")
    departure_time: Optional[datetime] = Field(None, description="출발 시간")
    preferences: Optional[Dict[str, Any]] = Field(None, description="사용자 선호도")

class RouteSegment(BaseModel):
    """경로 구간 모델"""
    start: Coordinate
    end: Coordinate
    distance: float
    duration: int
    air_quality: Dict[str, float]
    instructions: str

class RouteInfo(BaseModel):
    """경로 정보 모델"""
    route_id: str
    type: str
    summary: Dict[str, Any]
    waypoints: List[Coordinate]
    segments: List[RouteSegment]
    polyline: str

class RouteResponse(BaseModel):
    """경로 응답 스키마"""
    success: bool
    routes: List[RouteInfo]
    calculation_time: datetime
    message: str

# 유틸리티 함수들
def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """두 좌표 간의 거리 계산 (Haversine 공식)"""
    R = 6371  # 지구 반지름 (km)
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat/2) * math.sin(dlat/2) + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon/2) * math.sin(dlon/2))
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    
    return distance

def interpolate_coordinates(start: Coordinate, end: Coordinate, num_points: int = 10) -> List[Coordinate]:
    """두 좌표 사이의 중간점들을 생성"""
    coordinates = []
    
    for i in range(num_points + 1):
        ratio = i / num_points
        lat = start.latitude + (end.latitude - start.latitude) * ratio
        lon = start.longitude + (end.longitude - start.longitude) * ratio
        coordinates.append(Coordinate(latitude=lat, longitude=lon))
    
    return coordinates

# 외부 API 호출 함수들
async def fetch_routes_from_kakao(start: Coordinate, end: Coordinate) -> List[Dict[str, Any]]:
    """
    Kakao Maps API에서 경로 정보를 가져오는 함수
    실제 구현에서는 실제 Kakao Maps API를 사용해야 합니다.
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # 가상의 Kakao Maps API 호출
            response = await client.get(
                f"{KAKAO_MAPS_URL}/routes",
                params={
                    "origin": f"{start.latitude},{start.longitude}",
                    "destination": f"{end.latitude},{end.longitude}",
                    "waypoints": "",
                    "priority": "RECOMMEND"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # 가상의 경로 데이터 생성 (실제로는 API 응답 파싱)
                routes = []
                for i, route_data in enumerate(data.get("routes", [])):
                    route = {
                        "route_id": f"route_{i+1}",
                        "type": ["fastest", "shortest", "healthiest"][i % 3],
                        "distance": route_data.get("distance", 1000 + i * 500),
                        "duration": route_data.get("duration", 600 + i * 300),
                        "polyline": route_data.get("polyline", "dummy_polyline"),
                        "waypoints": route_data.get("waypoints", [])
                    }
                    routes.append(route)
                
                # 실제 API가 없는 경우 더미 데이터 생성
                if not routes:
                    routes = generate_dummy_routes(start, end)
                
                logger.info(f"Kakao Maps API에서 {len(routes)}개의 경로를 가져왔습니다.")
                return routes
            else:
                logger.warning(f"Kakao Maps API 호출 실패: {response.status_code}")
                return generate_dummy_routes(start, end)
                
    except Exception as e:
        logger.error(f"Kakao Maps API 호출 중 오류: {e}")
        return generate_dummy_routes(start, end)

def generate_dummy_routes(start: Coordinate, end: Coordinate) -> List[Dict[str, Any]]:
    """더미 경로 데이터 생성 (개발용)"""
    routes = []
    
    # 가장 빠른 경로
    routes.append({
        "route_id": "route_001",
        "type": "fastest",
        "distance": calculate_distance(start.latitude, start.longitude, end.latitude, end.longitude) * 1.1,
        "duration": 25,
        "polyline": "dummy_polyline_fastest",
        "waypoints": [start.dict(), end.dict()]
    })
    
    # 가장 짧은 경로
    routes.append({
        "route_id": "route_002", 
        "type": "shortest",
        "distance": calculate_distance(start.latitude, start.longitude, end.latitude, end.longitude),
        "duration": 35,
        "polyline": "dummy_polyline_shortest",
        "waypoints": [start.dict(), end.dict()]
    })
    
    # 가장 건강한 경로
    routes.append({
        "route_id": "route_003",
        "type": "healthiest", 
        "distance": calculate_distance(start.latitude, start.longitude, end.latitude, end.longitude) * 1.3,
        "duration": 45,
        "polyline": "dummy_polyline_healthiest",
        "waypoints": [start.dict(), end.dict()]
    })
    
    return routes

async def get_air_quality_predictions(coordinates: List[Coordinate]) -> List[Dict[str, Any]]:
    """
    AI 예측 서비스에서 대기질 예측을 가져오는 함수
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            predictions = []
            
            # 각 좌표에 대해 대기질 예측 요청
            for coord in coordinates:
                try:
                    response = await client.post(
                        f"{AI_PREDICTION_URL}/api/v1/predict",
                        json={
                            "latitude": coord.latitude,
                            "longitude": coord.longitude,
                            "prediction_hours": 1
                        }
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get("success") and data.get("predictions"):
                            prediction = data["predictions"][0]  # 첫 번째 시간 예측
                            predictions.append({
                                "latitude": coord.latitude,
                                "longitude": coord.longitude,
                                "pm25": prediction.get("predicted_pm25", 25.0),
                                "pm10": prediction.get("predicted_pm10", 40.0),
                                "o3": prediction.get("predicted_o3", 0.05),
                                "no2": prediction.get("predicted_no2", 0.02),
                                "air_quality_index": prediction.get("air_quality_index", 50),
                                "grade": prediction.get("grade", "moderate"),
                                "confidence": prediction.get("confidence", 0.8)
                            })
                        else:
                            # 예측 실패 시 기본값 사용
                            predictions.append(create_default_air_quality(coord))
                    else:
                        logger.warning(f"AI 예측 서비스 호출 실패: {response.status_code}")
                        predictions.append(create_default_air_quality(coord))
                        
                except Exception as e:
                    logger.error(f"좌표 {coord.latitude}, {coord.longitude} 예측 실패: {e}")
                    predictions.append(create_default_air_quality(coord))
            
            logger.info(f"{len(predictions)}개 좌표의 대기질 예측을 완료했습니다.")
            return predictions
            
    except Exception as e:
        logger.error(f"대기질 예측 요청 중 오류: {e}")
        # 모든 좌표에 대해 기본값 반환
        return [create_default_air_quality(coord) for coord in coordinates]

def create_default_air_quality(coord: Coordinate) -> Dict[str, Any]:
    """기본 대기질 데이터 생성"""
    return {
        "latitude": coord.latitude,
        "longitude": coord.longitude,
        "pm25": 25.0,
        "pm10": 40.0,
        "o3": 0.05,
        "no2": 0.02,
        "air_quality_index": 50,
        "grade": "moderate",
        "confidence": 0.5
    }

# 경로 처리 함수들
def calculate_route_air_quality_score(air_quality_data: List[Dict[str, Any]]) -> float:
    """경로의 평균 대기질 점수 계산"""
    if not air_quality_data:
        return 50.0  # 기본값
    
    # PM2.5 기준으로 점수 계산 (낮을수록 좋음)
    pm25_values = [data.get("pm25", 25.0) for data in air_quality_data]
    avg_pm25 = sum(pm25_values) / len(pm25_values)
    
    # 0-100 점수로 변환 (낮은 PM2.5 = 높은 점수)
    score = max(0, min(100, 100 - (avg_pm25 - 15) * 2))
    return round(score, 2)

def create_route_segments(waypoints: List[Coordinate], air_quality_data: List[Dict[str, Any]]) -> List[RouteSegment]:
    """경로 구간 생성"""
    segments = []
    
    for i in range(len(waypoints) - 1):
        start = waypoints[i]
        end = waypoints[i + 1]
        
        # 해당 구간의 대기질 데이터 찾기
        segment_air_quality = None
        for aq_data in air_quality_data:
            if (abs(aq_data["latitude"] - start.latitude) < 0.001 and 
                abs(aq_data["longitude"] - start.longitude) < 0.001):
                segment_air_quality = aq_data
                break
        
        if not segment_air_quality:
            segment_air_quality = create_default_air_quality(start)
        
        segment = RouteSegment(
            start=start,
            end=end,
            distance=calculate_distance(start.latitude, start.longitude, end.latitude, end.longitude),
            duration=5,  # 기본 5분
            air_quality={
                "pm25": segment_air_quality["pm25"],
                "pm10": segment_air_quality["pm10"],
                "o3": segment_air_quality["o3"],
                "no2": segment_air_quality["no2"],
                "air_quality_index": segment_air_quality["air_quality_index"],
                "grade": segment_air_quality["grade"]
            },
            instructions=f"{i+1}번째 구간을 따라 이동하세요"
        )
        segments.append(segment)
    
    return segments

async def process_route(
    route_data: Dict[str, Any], 
    start: Coordinate, 
    end: Coordinate
) -> RouteInfo:
    """개별 경로 처리"""
    try:
        # 경로의 좌표들을 생성 (간단한 보간)
        waypoints = [start]
        
        # 중간점들 생성 (실제로는 polyline 디코딩 필요)
        num_intermediate_points = 5
        for i in range(1, num_intermediate_points):
            ratio = i / num_intermediate_points
            lat = start.latitude + (end.latitude - start.latitude) * ratio
            lon = start.longitude + (end.longitude - start.longitude) * ratio
            waypoints.append(Coordinate(latitude=lat, longitude=lon))
        
        waypoints.append(end)
        
        # 대기질 예측 요청
        air_quality_data = await get_air_quality_predictions(waypoints)
        
        # 대기질 점수 계산
        air_quality_score = calculate_route_air_quality_score(air_quality_data)
        
        # 경로 구간 생성
        segments = create_route_segments(waypoints, air_quality_data)
        
        # 경로 정보 생성
        route_info = RouteInfo(
            route_id=route_data["route_id"],
            type=route_data["type"],
            summary={
                "duration": route_data["duration"],
                "distance": round(route_data["distance"], 2),
                "air_quality_score": air_quality_score,
                "pollution_exposure": {
                    "pm25": round(sum(aq["pm25"] for aq in air_quality_data) / len(air_quality_data), 2),
                    "pm10": round(sum(aq["pm10"] for aq in air_quality_data) / len(air_quality_data), 2),
                    "o3": round(sum(aq["o3"] for aq in air_quality_data) / len(air_quality_data), 3)
                }
            },
            waypoints=waypoints,
            segments=segments,
            polyline=route_data["polyline"]
        )
        
        return route_info
        
    except Exception as e:
        logger.error(f"경로 처리 실패: {e}")
        raise

# API 엔드포인트
@app.get("/health")
async def health_check():
    """서비스 상태 확인"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "ai_prediction_url": AI_PREDICTION_URL,
        "kakao_maps_url": KAKAO_MAPS_URL
    }

@app.get("/api/v1/routes", response_model=RouteResponse)
async def calculate_routes(
    start_lat: float = Query(..., description="출발지 위도"),
    start_lon: float = Query(..., description="출발지 경도"),
    end_lat: float = Query(..., description="목적지 위도"),
    end_lon: float = Query(..., description="목적지 경도"),
    route_types: str = Query("fastest,shortest,healthiest", description="경로 타입 (쉼표로 구분)")
):
    """경로 계산 API"""
    try:
        start_time = datetime.now()
        
        # 좌표 생성
        start = Coordinate(latitude=start_lat, longitude=start_lon)
        end = Coordinate(latitude=end_lat, longitude=end_lon)
        
        # 요청된 경로 타입 파싱
        requested_types = [t.strip() for t in route_types.split(",")]
        
        # Kakao Maps API에서 경로 정보 가져오기
        route_data_list = await fetch_routes_from_kakao(start, end)
        
        # 요청된 타입만 필터링
        filtered_routes = [route for route in route_data_list if route["type"] in requested_types]
        
        # 각 경로 처리 (병렬 처리)
        route_tasks = [process_route(route_data, start, end) for route_data in filtered_routes]
        processed_routes = await asyncio.gather(*route_tasks, return_exceptions=True)
        
        # 예외 처리
        valid_routes = []
        for i, route in enumerate(processed_routes):
            if isinstance(route, Exception):
                logger.error(f"경로 {i} 처리 실패: {route}")
            else:
                valid_routes.append(route)
        
        # 경로 정렬 (대기질 점수 기준)
        valid_routes.sort(key=lambda x: x.summary["air_quality_score"], reverse=True)
        
        calculation_time = datetime.now()
        processing_duration = (calculation_time - start_time).total_seconds()
        
        return RouteResponse(
            success=True,
            routes=valid_routes,
            calculation_time=calculation_time,
            message=f"{len(valid_routes)}개의 경로를 {processing_duration:.2f}초 만에 계산했습니다."
        )
        
    except Exception as e:
        logger.error(f"경로 계산 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/routes/calculate", response_model=RouteResponse)
async def calculate_routes_post(request: RouteRequest):
    """경로 계산 API (POST 방식)"""
    try:
        start_time = datetime.now()
        
        # Kakao Maps API에서 경로 정보 가져오기
        route_data_list = await fetch_routes_from_kakao(request.start, request.end)
        
        # 요청된 타입만 필터링
        filtered_routes = [route for route in route_data_list if route["type"] in request.route_types]
        
        # 각 경로 처리 (병렬 처리)
        route_tasks = [process_route(route_data, request.start, request.end) for route_data in filtered_routes]
        processed_routes = await asyncio.gather(*route_tasks, return_exceptions=True)
        
        # 예외 처리
        valid_routes = []
        for i, route in enumerate(processed_routes):
            if isinstance(route, Exception):
                logger.error(f"경로 {i} 처리 실패: {route}")
            else:
                valid_routes.append(route)
        
        # 경로 정렬 (대기질 점수 기준)
        valid_routes.sort(key=lambda x: x.summary["air_quality_score"], reverse=True)
        
        calculation_time = datetime.now()
        processing_duration = (calculation_time - start_time).total_seconds()
        
        return RouteResponse(
            success=True,
            routes=valid_routes,
            calculation_time=calculation_time,
            message=f"{len(valid_routes)}개의 경로를 {processing_duration:.2f}초 만에 계산했습니다."
        )
        
    except Exception as e:
        logger.error(f"경로 계산 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 애플리케이션 생명주기 이벤트
@app.on_event("startup")
async def startup_event():
    """애플리케이션 시작 시 실행"""
    logger.info("경로 로직 서비스를 시작합니다.")
    logger.info(f"AI 예측 서비스 URL: {AI_PREDICTION_URL}")
    logger.info(f"Kakao Maps API URL: {KAKAO_MAPS_URL}")

@app.on_event("shutdown")
async def shutdown_event():
    """애플리케이션 종료 시 실행"""
    logger.info("경로 로직 서비스를 종료합니다.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
