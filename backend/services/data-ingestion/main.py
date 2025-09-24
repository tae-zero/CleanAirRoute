"""
데이터 수집 서비스 (Data Ingestion Service)
- 에어코리아 및 기상청 API에서 대기질 및 기상 데이터를 수집
- PostgreSQL 데이터베이스에 저장
- 1시간마다 자동 실행되는 스케줄러 포함
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Optional
import os

import asyncpg
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 초기화
app = FastAPI(
    title="Data Ingestion Service",
    description="대기질 및 기상 데이터 수집 서비스",
    version="1.0.0"
)

# 전역 변수
db_pool: Optional[asyncpg.Pool] = None
scheduler = AsyncIOScheduler()

# Pydantic 모델 정의
class AirQualityReading(BaseModel):
    """대기질 측정 데이터 스키마"""
    station_id: str = Field(..., description="측정소 ID")
    station_name: str = Field(..., description="측정소 이름")
    latitude: float = Field(..., description="위도")
    longitude: float = Field(..., description="경도")
    measured_at: datetime = Field(..., description="측정 시간")
    pm25: Optional[float] = Field(None, description="PM2.5 농도 (μg/m³)")
    pm10: Optional[float] = Field(None, description="PM10 농도 (μg/m³)")
    o3: Optional[float] = Field(None, description="오존 농도 (ppm)")
    no2: Optional[float] = Field(None, description="이산화질소 농도 (ppm)")
    co: Optional[float] = Field(None, description="일산화탄소 농도 (ppm)")
    so2: Optional[float] = Field(None, description="이산화황 농도 (ppm)")
    air_quality_index: Optional[int] = Field(None, description="통합 대기질 지수")
    grade: Optional[str] = Field(None, description="대기질 등급")

class WeatherReading(BaseModel):
    """기상 측정 데이터 스키마"""
    station_id: str = Field(..., description="기상관측소 ID")
    latitude: float = Field(..., description="위도")
    longitude: float = Field(..., description="경도")
    measured_at: datetime = Field(..., description="측정 시간")
    temperature: Optional[float] = Field(None, description="기온 (°C)")
    humidity: Optional[float] = Field(None, description="습도 (%)")
    wind_speed: Optional[float] = Field(None, description="풍속 (m/s)")
    wind_direction: Optional[float] = Field(None, description="풍향 (도)")
    precipitation: Optional[float] = Field(None, description="강수량 (mm)")
    pressure: Optional[float] = Field(None, description="기압 (hPa)")

class DataCollectionResponse(BaseModel):
    """데이터 수집 응답 스키마"""
    success: bool
    message: str
    collected_count: int
    timestamp: datetime

# 데이터베이스 연결 관리
async def init_db():
    """PostgreSQL 데이터베이스 연결 초기화"""
    global db_pool
    try:
        database_url = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/cleanair_route")
        db_pool = await asyncpg.create_pool(
            database_url,
            min_size=5,
            max_size=20,
            command_timeout=60
        )
        logger.info("데이터베이스 연결이 성공적으로 초기화되었습니다.")
    except Exception as e:
        logger.error(f"데이터베이스 연결 실패: {e}")
        raise

async def close_db():
    """데이터베이스 연결 종료"""
    global db_pool
    if db_pool:
        await db_pool.close()
        logger.info("데이터베이스 연결이 종료되었습니다.")

# 데이터 수집 함수들
async def fetch_air_quality_data() -> List[AirQualityReading]:
    """
    에어코리아 API에서 대기질 데이터를 비동기적으로 가져오는 함수
    실제 구현에서는 실제 API 엔드포인트와 인증 정보를 사용해야 합니다.
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # 가상의 API 엔드포인트 (실제로는 에어코리아 API 사용)
            response = await client.get("https://api.airkorea.co.kr/data")
            
            if response.status_code == 200:
                data = response.json()
                
                # 응답 데이터를 AirQualityReading 모델로 변환
                readings = []
                for item in data.get("items", []):
                    try:
                        reading = AirQualityReading(
                            station_id=item["station_id"],
                            station_name=item["station_name"],
                            latitude=float(item["latitude"]),
                            longitude=float(item["longitude"]),
                            measured_at=datetime.fromisoformat(item["measured_at"]),
                            pm25=float(item.get("pm25", 0)) if item.get("pm25") else None,
                            pm10=float(item.get("pm10", 0)) if item.get("pm10") else None,
                            o3=float(item.get("o3", 0)) if item.get("o3") else None,
                            no2=float(item.get("no2", 0)) if item.get("no2") else None,
                            co=float(item.get("co", 0)) if item.get("co") else None,
                            so2=float(item.get("so2", 0)) if item.get("so2") else None,
                            air_quality_index=int(item.get("air_quality_index", 0)) if item.get("air_quality_index") else None,
                            grade=item.get("grade")
                        )
                        readings.append(reading)
                    except (ValueError, KeyError) as e:
                        logger.warning(f"데이터 변환 실패: {e}")
                        continue
                
                logger.info(f"대기질 데이터 {len(readings)}개를 성공적으로 수집했습니다.")
                return readings
            else:
                logger.error(f"에어코리아 API 호출 실패: {response.status_code}")
                return []
                
    except Exception as e:
        logger.error(f"대기질 데이터 수집 중 오류 발생: {e}")
        return []

async def fetch_weather_data() -> List[WeatherReading]:
    """
    기상청 API에서 기상 데이터를 비동기적으로 가져오는 함수
    실제 구현에서는 실제 API 엔드포인트와 인증 정보를 사용해야 합니다.
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # 가상의 API 엔드포인트 (실제로는 기상청 API 사용)
            response = await client.get("https://api.kma.go.kr/data")
            
            if response.status_code == 200:
                data = response.json()
                
                # 응답 데이터를 WeatherReading 모델로 변환
                readings = []
                for item in data.get("items", []):
                    try:
                        reading = WeatherReading(
                            station_id=item["station_id"],
                            latitude=float(item["latitude"]),
                            longitude=float(item["longitude"]),
                            measured_at=datetime.fromisoformat(item["measured_at"]),
                            temperature=float(item.get("temperature", 0)) if item.get("temperature") else None,
                            humidity=float(item.get("humidity", 0)) if item.get("humidity") else None,
                            wind_speed=float(item.get("wind_speed", 0)) if item.get("wind_speed") else None,
                            wind_direction=float(item.get("wind_direction", 0)) if item.get("wind_direction") else None,
                            precipitation=float(item.get("precipitation", 0)) if item.get("precipitation") else None,
                            pressure=float(item.get("pressure", 0)) if item.get("pressure") else None
                        )
                        readings.append(reading)
                    except (ValueError, KeyError) as e:
                        logger.warning(f"기상 데이터 변환 실패: {e}")
                        continue
                
                logger.info(f"기상 데이터 {len(readings)}개를 성공적으로 수집했습니다.")
                return readings
            else:
                logger.error(f"기상청 API 호출 실패: {response.status_code}")
                return []
                
    except Exception as e:
        logger.error(f"기상 데이터 수집 중 오류 발생: {e}")
        return []

# 데이터베이스 저장 함수들
async def save_air_quality_data(readings: List[AirQualityReading]) -> int:
    """대기질 데이터를 PostgreSQL에 저장"""
    if not db_pool:
        raise HTTPException(status_code=500, detail="데이터베이스 연결이 없습니다.")
    
    saved_count = 0
    async with db_pool.acquire() as conn:
        for reading in readings:
            try:
                await conn.execute("""
                    INSERT INTO air_quality_readings 
                    (station_id, station_name, latitude, longitude, measured_at, 
                     pm25, pm10, o3, no2, co, so2, air_quality_index, grade)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    ON CONFLICT (station_id, measured_at) DO UPDATE SET
                    pm25 = EXCLUDED.pm25,
                    pm10 = EXCLUDED.pm10,
                    o3 = EXCLUDED.o3,
                    no2 = EXCLUDED.no2,
                    co = EXCLUDED.co,
                    so2 = EXCLUDED.so2,
                    air_quality_index = EXCLUDED.air_quality_index,
                    grade = EXCLUDED.grade,
                    updated_at = NOW()
                """, 
                reading.station_id, reading.station_name, reading.latitude, reading.longitude,
                reading.measured_at, reading.pm25, reading.pm10, reading.o3, reading.no2,
                reading.co, reading.so2, reading.air_quality_index, reading.grade)
                saved_count += 1
            except Exception as e:
                logger.error(f"대기질 데이터 저장 실패: {e}")
                continue
    
    logger.info(f"대기질 데이터 {saved_count}개를 데이터베이스에 저장했습니다.")
    return saved_count

async def save_weather_data(readings: List[WeatherReading]) -> int:
    """기상 데이터를 PostgreSQL에 저장"""
    if not db_pool:
        raise HTTPException(status_code=500, detail="데이터베이스 연결이 없습니다.")
    
    saved_count = 0
    async with db_pool.acquire() as conn:
        for reading in readings:
            try:
                await conn.execute("""
                    INSERT INTO weather_readings 
                    (station_id, latitude, longitude, measured_at, 
                     temperature, humidity, wind_speed, wind_direction, precipitation, pressure)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (station_id, measured_at) DO UPDATE SET
                    temperature = EXCLUDED.temperature,
                    humidity = EXCLUDED.humidity,
                    wind_speed = EXCLUDED.wind_speed,
                    wind_direction = EXCLUDED.wind_direction,
                    precipitation = EXCLUDED.precipitation,
                    pressure = EXCLUDED.pressure,
                    updated_at = NOW()
                """, 
                reading.station_id, reading.latitude, reading.longitude, reading.measured_at,
                reading.temperature, reading.humidity, reading.wind_speed, reading.wind_direction,
                reading.precipitation, reading.pressure)
                saved_count += 1
            except Exception as e:
                logger.error(f"기상 데이터 저장 실패: {e}")
                continue
    
    logger.info(f"기상 데이터 {saved_count}개를 데이터베이스에 저장했습니다.")
    return saved_count

# 스케줄러 작업
async def scheduled_data_collection():
    """스케줄러에 의해 실행되는 데이터 수집 작업"""
    logger.info("스케줄된 데이터 수집 작업을 시작합니다.")
    
    try:
        # 대기질 데이터 수집 및 저장
        air_quality_readings = await fetch_air_quality_data()
        air_quality_saved = await save_air_quality_data(air_quality_readings)
        
        # 기상 데이터 수집 및 저장
        weather_readings = await fetch_weather_data()
        weather_saved = await save_weather_data(weather_readings)
        
        total_saved = air_quality_saved + weather_saved
        logger.info(f"데이터 수집 작업 완료: 총 {total_saved}개 데이터 저장")
        
    except Exception as e:
        logger.error(f"스케줄된 데이터 수집 작업 실패: {e}")

# API 엔드포인트
@app.get("/health")
async def health_check():
    """서비스 상태 확인"""
    return {"status": "healthy", "timestamp": datetime.now()}

@app.post("/api/v1/collect/air-quality", response_model=DataCollectionResponse)
async def collect_air_quality_data():
    """대기질 데이터 수집 API"""
    try:
        readings = await fetch_air_quality_data()
        saved_count = await save_air_quality_data(readings)
        
        return DataCollectionResponse(
            success=True,
            message=f"대기질 데이터 {saved_count}개를 성공적으로 수집했습니다.",
            collected_count=saved_count,
            timestamp=datetime.now()
        )
    except Exception as e:
        logger.error(f"대기질 데이터 수집 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/collect/weather", response_model=DataCollectionResponse)
async def collect_weather_data():
    """기상 데이터 수집 API"""
    try:
        readings = await fetch_weather_data()
        saved_count = await save_weather_data(readings)
        
        return DataCollectionResponse(
            success=True,
            message=f"기상 데이터 {saved_count}개를 성공적으로 수집했습니다.",
            collected_count=saved_count,
            timestamp=datetime.now()
        )
    except Exception as e:
        logger.error(f"기상 데이터 수집 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/collect/all", response_model=DataCollectionResponse)
async def collect_all_data():
    """모든 데이터 수집 API"""
    try:
        # 대기질 데이터 수집
        air_quality_readings = await fetch_air_quality_data()
        air_quality_saved = await save_air_quality_data(air_quality_readings)
        
        # 기상 데이터 수집
        weather_readings = await fetch_weather_data()
        weather_saved = await save_weather_data(weather_readings)
        
        total_saved = air_quality_saved + weather_saved
        
        return DataCollectionResponse(
            success=True,
            message=f"모든 데이터 {total_saved}개를 성공적으로 수집했습니다.",
            collected_count=total_saved,
            timestamp=datetime.now()
        )
    except Exception as e:
        logger.error(f"전체 데이터 수집 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 애플리케이션 생명주기 이벤트
@app.on_event("startup")
async def startup_event():
    """애플리케이션 시작 시 실행"""
    logger.info("데이터 수집 서비스를 시작합니다.")
    
    # 데이터베이스 연결 초기화
    await init_db()
    
    # 스케줄러 설정 (1시간마다 실행)
    scheduler.add_job(
        scheduled_data_collection,
        trigger=IntervalTrigger(hours=1),
        id="data_collection_job",
        name="데이터 수집 작업",
        replace_existing=True
    )
    scheduler.start()
    logger.info("스케줄러가 시작되었습니다. (1시간마다 실행)")

@app.on_event("shutdown")
async def shutdown_event():
    """애플리케이션 종료 시 실행"""
    logger.info("데이터 수집 서비스를 종료합니다.")
    
    # 스케줄러 종료
    scheduler.shutdown()
    
    # 데이터베이스 연결 종료
    await close_db()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
