"""
대기질 및 경로 추천 비즈니스 로직 서비스
- 핵심 비즈니스 로직 구현
- 외부 API 호출 및 데이터 처리
- FastAPI에 독립적인 순수 Python 코드
"""

import asyncio
import logging
import math
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import httpx

from domain.air_quality.air_quality_schema import (
    RouteRequest, RouteResponse, RouteInfo, RouteSegment, 
    Coordinate, AirQualityData, AirQualityRequest, AirQualityResponse
)
from common.config import Settings

# 로깅 설정
logger = logging.getLogger(__name__)

class AirQualityService:
    """대기질 및 경로 추천 서비스 클래스"""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.ai_prediction_url = settings.ai_prediction_service_url
        self.kakao_maps_url = "https://maps.api.kakao.com"  # 가상 URL
        
    async def get_recommended_routes(self, request: RouteRequest) -> RouteResponse:
        """
        경로 추천 핵심 비즈니스 로직
        
        Args:
            request: 경로 요청 데이터
            
        Returns:
            RouteResponse: 추천 경로 응답
        """
        logger.info(f"경로 추천 요청: {request.start_lat}, {request.start_lon} -> {request.end_lat}, {request.end_lon}")
        
        try:
            # 1. 외부 지도 API 호출하여 경로 폴리라인 후보들 가져오기
            route_candidates = await self._fetch_route_candidates(request)
            
            if not route_candidates:
                return RouteResponse(
                    success=False,
                    message="경로를 찾을 수 없습니다.",
                    total_routes=0
                )
            
            # 2. 각 경로를 샘플링하여 좌표들 추출
            processed_routes = []
            for candidate in route_candidates:
                processed_route = await self._process_route_candidate(candidate, request)
                if processed_route:
                    processed_routes.append(processed_route)
            
            # 3. 경로별 평균 대기질 점수, 소요 시간, 거리 계산
            scored_routes = await self._calculate_route_scores(processed_routes)
            
            # 4. '최단', '최적', '가장 깨끗한' 경로 결정
            response = self._determine_optimal_routes(scored_routes)
            
            logger.info(f"경로 추천 완료: {response.total_routes}개 경로 생성")
            return response
            
        except Exception as e:
            logger.error(f"경로 추천 중 오류 발생: {e}")
            return RouteResponse(
                success=False,
                message=f"경로 추천 중 오류가 발생했습니다: {str(e)}",
                total_routes=0
            )
    
    async def _fetch_route_candidates(self, request: RouteRequest) -> List[Dict[str, Any]]:
        """
        외부 지도 API에서 경로 후보들을 가져오는 함수
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # 가상의 Kakao Maps API 호출
                response = await client.get(
                    f"{self.kakao_maps_url}/routes",
                    params={
                        "origin": f"{request.start_lat},{request.start_lon}",
                        "destination": f"{request.end_lat},{request.end_lon}",
                        "priority": "RECOMMEND"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("routes", [])
                else:
                    logger.warning(f"지도 API 호출 실패: {response.status_code}")
                    return self._generate_dummy_routes(request)
                    
        except Exception as e:
            logger.error(f"지도 API 호출 중 오류: {e}")
            return self._generate_dummy_routes(request)
    
    def _generate_dummy_routes(self, request: RouteRequest) -> List[Dict[str, Any]]:
        """
        개발용 더미 경로 데이터 생성
        """
        distance = self._calculate_distance(
            request.start_lat, request.start_lon,
            request.end_lat, request.end_lon
        )
        
        return [
            {
                "route_id": "route_001",
                "type": "fastest",
                "distance": distance * 1.1,
                "duration": 25,
                "polyline": "dummy_polyline_fastest",
                "waypoints": [
                    {"latitude": request.start_lat, "longitude": request.start_lon},
                    {"latitude": request.end_lat, "longitude": request.end_lon}
                ]
            },
            {
                "route_id": "route_002",
                "type": "shortest",
                "distance": distance,
                "duration": 35,
                "polyline": "dummy_polyline_shortest",
                "waypoints": [
                    {"latitude": request.start_lat, "longitude": request.start_lon},
                    {"latitude": request.end_lat, "longitude": request.end_lon}
                ]
            },
            {
                "route_id": "route_003",
                "type": "healthiest",
                "distance": distance * 1.3,
                "duration": 45,
                "polyline": "dummy_polyline_healthiest",
                "waypoints": [
                    {"latitude": request.start_lat, "longitude": request.start_lon},
                    {"latitude": request.end_lat, "longitude": request.end_lon}
                ]
            }
        ]
    
    async def _process_route_candidate(self, candidate: Dict[str, Any], request: RouteRequest) -> Optional[Dict[str, Any]]:
        """
        경로 후보를 처리하여 좌표들을 샘플링
        """
        try:
            waypoints = candidate.get("waypoints", [])
            
            # 경로를 일정한 간격으로 샘플링하여 좌표들 생성
            sampled_coordinates = self._sample_route_coordinates(waypoints)
            
            # 각 좌표에 대해 대기질 예측 요청
            air_quality_data = await self._get_air_quality_predictions(sampled_coordinates)
            
            # 경로 정보 업데이트
            candidate["sampled_coordinates"] = sampled_coordinates
            candidate["air_quality_data"] = air_quality_data
            
            return candidate
            
        except Exception as e:
            logger.error(f"경로 후보 처리 실패: {e}")
            return None
    
    def _sample_route_coordinates(self, waypoints: List[Dict[str, float]], num_samples: int = 10) -> List[Coordinate]:
        """
        경로를 일정한 간격으로 샘플링하여 좌표들 생성
        """
        if len(waypoints) < 2:
            return []
        
        sampled = []
        for i in range(num_samples + 1):
            ratio = i / num_samples
            
            # 첫 번째와 마지막 waypoint 사이를 보간
            start_point = waypoints[0]
            end_point = waypoints[-1]
            
            lat = start_point["latitude"] + (end_point["latitude"] - start_point["latitude"]) * ratio
            lon = start_point["longitude"] + (end_point["longitude"] - start_point["longitude"]) * ratio
            
            sampled.append(Coordinate(latitude=lat, longitude=lon))
        
        return sampled
    
    async def _get_air_quality_predictions(self, coordinates: List[Coordinate]) -> List[AirQualityData]:
        """
        내부 AI 예측 서비스 API를 호출하여 각 좌표의 예측 대기질을 가져오기
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                predictions = []
                
                for coord in coordinates:
                    try:
                        response = await client.post(
                            f"{self.ai_prediction_url}/api/v1/predict",
                            json={
                                "latitude": coord.latitude,
                                "longitude": coord.longitude,
                                "prediction_hours": 1
                            }
                        )
                        
                        if response.status_code == 200:
                            data = response.json()
                            if data.get("success") and data.get("predictions"):
                                pred = data["predictions"][0]
                                air_quality = AirQualityData(
                                    pm25=pred.get("predicted_pm25", 25.0),
                                    pm10=pred.get("predicted_pm10", 40.0),
                                    o3=pred.get("predicted_o3", 0.05),
                                    no2=pred.get("predicted_no2", 0.02),
                                    air_quality_index=pred.get("air_quality_index", 50),
                                    grade=pred.get("grade", "moderate"),
                                    confidence=pred.get("confidence", 0.8)
                                )
                                predictions.append(air_quality)
                            else:
                                predictions.append(self._create_default_air_quality())
                        else:
                            logger.warning(f"AI 예측 서비스 호출 실패: {response.status_code}")
                            predictions.append(self._create_default_air_quality())
                            
                    except Exception as e:
                        logger.error(f"좌표 {coord.latitude}, {coord.longitude} 예측 실패: {e}")
                        predictions.append(self._create_default_air_quality())
                
                return predictions
                
        except Exception as e:
            logger.error(f"대기질 예측 요청 중 오류: {e}")
            return [self._create_default_air_quality() for _ in coordinates]
    
    def _create_default_air_quality(self) -> AirQualityData:
        """기본 대기질 데이터 생성"""
        return AirQualityData(
            pm25=25.0,
            pm10=40.0,
            o3=0.05,
            no2=0.02,
            air_quality_index=50,
            grade="moderate",
            confidence=0.5
        )
    
    async def _calculate_route_scores(self, routes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        각 경로의 평균 대기질 점수, 소요 시간, 거리 계산
        """
        scored_routes = []
        
        for route in routes:
            try:
                air_quality_data = route.get("air_quality_data", [])
                
                if not air_quality_data:
                    continue
                
                # 평균 대기질 점수 계산
                avg_aqi = sum(aq.air_quality_index for aq in air_quality_data) / len(air_quality_data)
                air_quality_score = max(0, min(100, 100 - (avg_aqi - 50) * 2))
                
                # 오염물질 노출량 계산
                pollution_exposure = {
                    "pm25": sum(aq.pm25 for aq in air_quality_data) / len(air_quality_data),
                    "pm10": sum(aq.pm10 for aq in air_quality_data) / len(air_quality_data),
                    "o3": sum(aq.o3 for aq in air_quality_data) / len(air_quality_data),
                    "no2": sum(aq.no2 for aq in air_quality_data) / len(air_quality_data)
                }
                
                # 경로 구간 생성
                segments = self._create_route_segments(
                    route.get("sampled_coordinates", []),
                    air_quality_data
                )
                
                # 경로 정보 생성
                route_info = RouteInfo(
                    route_id=route["route_id"],
                    type=route["type"],
                    travel_time_minutes=route["duration"],
                    distance_km=route["distance"],
                    average_aqi=avg_aqi,
                    air_quality_score=air_quality_score,
                    pollution_exposure=pollution_exposure,
                    waypoints=route.get("sampled_coordinates", []),
                    segments=segments,
                    polyline=route["polyline"]
                )
                
                scored_routes.append({
                    "route_info": route_info,
                    "air_quality_score": air_quality_score,
                    "duration": route["duration"],
                    "distance": route["distance"]
                })
                
            except Exception as e:
                logger.error(f"경로 점수 계산 실패: {e}")
                continue
        
        return scored_routes
    
    def _create_route_segments(self, coordinates: List[Coordinate], air_quality_data: List[AirQualityData]) -> List[RouteSegment]:
        """경로 구간 생성"""
        segments = []
        
        for i in range(len(coordinates) - 1):
            start = coordinates[i]
            end = coordinates[i + 1]
            
            # 해당 구간의 대기질 데이터
            segment_air_quality = air_quality_data[i] if i < len(air_quality_data) else self._create_default_air_quality()
            
            segment = RouteSegment(
                start=start,
                end=end,
                distance=self._calculate_distance(start.latitude, start.longitude, end.latitude, end.longitude),
                duration=5,  # 기본 5분
                air_quality=segment_air_quality,
                instructions=f"{i+1}번째 구간을 따라 이동하세요"
            )
            segments.append(segment)
        
        return segments
    
    def _determine_optimal_routes(self, scored_routes: List[Dict[str, Any]]) -> RouteResponse:
        """
        '최단', '최적', '가장 깨끗한' 경로 결정
        """
        if not scored_routes:
            return RouteResponse(
                success=False,
                message="유효한 경로가 없습니다.",
                total_routes=0
            )
        
        # 경로 타입별로 분류
        routes_by_type = {}
        for route in scored_routes:
            route_type = route["route_info"].type
            routes_by_type[route_type] = route["route_info"]
        
        # 최적 경로 계산 (대기질 점수와 시간의 가중 평균)
        optimal_route = None
        best_score = -1
        
        for route in scored_routes:
            # 대기질 점수 70%, 시간 효율성 30% 가중치
            time_score = max(0, 100 - route["duration"] * 2)  # 시간이 짧을수록 높은 점수
            combined_score = route["air_quality_score"] * 0.7 + time_score * 0.3
            
            if combined_score > best_score:
                best_score = combined_score
                optimal_route = route["route_info"]
        
        return RouteResponse(
            success=True,
            message=f"{len(scored_routes)}개의 경로를 성공적으로 계산했습니다.",
            fastest_route=routes_by_type.get("fastest"),
            shortest_route=routes_by_type.get("shortest"),
            healthiest_route=routes_by_type.get("healthiest"),
            optimal_route=optimal_route,
            total_routes=len(scored_routes)
        )
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
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
