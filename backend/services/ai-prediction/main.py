"""
AI 예측 서비스 (AI Prediction Service)
- 미리 학습된 대기질 예측 모델을 서빙
- 실시간 대기질 예측 API 제공
- 모델 로딩 및 예측 결과 캐싱
"""

import logging
import pickle
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
import numpy as np
import pandas as pd

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sklearn.preprocessing import MinMaxScaler
import joblib

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 초기화
app = FastAPI(
    title="AI Prediction Service",
    description="대기질 예측 AI 모델 서빙 서비스",
    version="1.0.0"
)

# 전역 변수
model = None
scaler = None
model_loaded = False

# Pydantic 모델 정의
class PredictionRequest(BaseModel):
    """예측 요청 스키마"""
    latitude: float = Field(..., description="위도", ge=-90, le=90)
    longitude: float = Field(..., description="경도", ge=-180, le=180)
    prediction_hours: int = Field(24, description="예측 시간 (시간)", ge=1, le=72)
    current_weather: Optional[Dict[str, float]] = Field(None, description="현재 기상 조건")
    historical_data: Optional[List[Dict[str, Any]]] = Field(None, description="과거 대기질 데이터")

class PredictionResponse(BaseModel):
    """예측 응답 스키마"""
    success: bool
    predictions: List[Dict[str, Any]]
    confidence: float
    model_version: str
    prediction_time: datetime
    message: str

class ModelStatus(BaseModel):
    """모델 상태 스키마"""
    loaded: bool
    model_version: str
    last_updated: datetime
    prediction_count: int

# 모델 로딩 함수
def load_model():
    """학습된 모델과 스케일러를 로드"""
    global model, scaler, model_loaded
    
    try:
        model_path = os.getenv("MODEL_PATH", "./model.pkl")
        scaler_path = os.getenv("SCALER_PATH", "./scaler.pkl")
        
        # 모델 로드
        if os.path.exists(model_path):
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            logger.info(f"모델이 성공적으로 로드되었습니다: {model_path}")
        else:
            # 모델 파일이 없는 경우 더미 모델 생성 (개발용)
            logger.warning("모델 파일이 없습니다. 더미 모델을 생성합니다.")
            model = create_dummy_model()
        
        # 스케일러 로드
        if os.path.exists(scaler_path):
            scaler = joblib.load(scaler_path)
            logger.info(f"스케일러가 성공적으로 로드되었습니다: {scaler_path}")
        else:
            # 스케일러 파일이 없는 경우 더미 스케일러 생성
            logger.warning("스케일러 파일이 없습니다. 더미 스케일러를 생성합니다.")
            scaler = create_dummy_scaler()
        
        model_loaded = True
        logger.info("모델과 스케일러 로딩이 완료되었습니다.")
        
    except Exception as e:
        logger.error(f"모델 로딩 실패: {e}")
        model_loaded = False
        raise

def create_dummy_model():
    """개발용 더미 모델 생성"""
    from sklearn.ensemble import RandomForestRegressor
    
    # 더미 데이터로 모델 학습
    X_dummy = np.random.rand(100, 10)  # 10개 피처
    y_dummy = np.random.rand(100) * 100  # PM2.5 값 (0-100)
    
    model = RandomForestRegressor(n_estimators=10, random_state=42)
    model.fit(X_dummy, y_dummy)
    
    return model

def create_dummy_scaler():
    """개발용 더미 스케일러 생성"""
    scaler = MinMaxScaler()
    # 더미 데이터로 스케일러 피팅
    dummy_data = np.random.rand(100, 10)
    scaler.fit(dummy_data)
    return scaler

# 데이터 전처리 함수
def preprocess_input_data(
    latitude: float,
    longitude: float,
    current_weather: Optional[Dict[str, float]] = None,
    historical_data: Optional[List[Dict[str, Any]]] = None
) -> np.ndarray:
    """
    입력 데이터를 모델이 이해할 수 있는 형태로 전처리
    """
    try:
        # 기본 피처 생성
        features = []
        
        # 위치 정보
        features.extend([latitude, longitude])
        
        # 시간 피처 (현재 시간 기준)
        now = datetime.now()
        features.extend([
            now.hour,
            now.day_of_week,
            now.month,
            now.isocalendar().week
        ])
        
        # 기상 데이터 (기본값 사용)
        if current_weather:
            features.extend([
                current_weather.get("temperature", 20.0),
                current_weather.get("humidity", 50.0),
                current_weather.get("wind_speed", 2.0),
                current_weather.get("pressure", 1013.25)
            ])
        else:
            features.extend([20.0, 50.0, 2.0, 1013.25])  # 기본값
        
        # 과거 데이터가 있는 경우 평균값 계산
        if historical_data and len(historical_data) > 0:
            pm25_values = [item.get("pm25", 25.0) for item in historical_data if item.get("pm25")]
            if pm25_values:
                features.append(np.mean(pm25_values))
            else:
                features.append(25.0)  # 기본값
        else:
            features.append(25.0)  # 기본값
        
        # 피처 배열로 변환
        feature_array = np.array(features).reshape(1, -1)
        
        # 스케일링 적용
        if scaler:
            feature_array = scaler.transform(feature_array)
        
        return feature_array
        
    except Exception as e:
        logger.error(f"데이터 전처리 실패: {e}")
        raise HTTPException(status_code=500, detail=f"데이터 전처리 실패: {e}")

# 예측 함수
def predict_air_quality(
    latitude: float,
    longitude: float,
    prediction_hours: int = 24,
    current_weather: Optional[Dict[str, float]] = None,
    historical_data: Optional[List[Dict[str, Any]]] = None
) -> List[Dict[str, Any]]:
    """
    대기질 예측 수행
    """
    try:
        if not model_loaded or model is None:
            raise HTTPException(status_code=500, detail="모델이 로드되지 않았습니다.")
        
        predictions = []
        
        # 각 시간대별 예측
        for hour in range(1, prediction_hours + 1):
            # 시간별 피처 조정
            adjusted_weather = current_weather.copy() if current_weather else {}
            
            # 시간에 따른 기온 변화 시뮬레이션 (간단한 모델)
            if "temperature" in adjusted_weather:
                # 일일 기온 변화 패턴 적용
                hour_of_day = (datetime.now().hour + hour) % 24
                temp_variation = 5 * np.sin((hour_of_day - 6) * np.pi / 12)
                adjusted_weather["temperature"] += temp_variation
            
            # 데이터 전처리
            features = preprocess_input_data(
                latitude, longitude, adjusted_weather, historical_data
            )
            
            # 예측 수행
            prediction = model.predict(features)[0]
            
            # 예측값을 현실적인 범위로 제한
            prediction = max(0, min(500, prediction))
            
            # 신뢰도 계산 (간단한 방법)
            confidence = max(0.5, min(1.0, 1.0 - abs(prediction - 25) / 100))
            
            # 예측 시간 계산
            prediction_time = datetime.now() + pd.Timedelta(hours=hour)
            
            predictions.append({
                "hour": hour,
                "predicted_pm25": round(prediction, 2),
                "predicted_pm10": round(prediction * 1.5, 2),  # PM10은 PM2.5의 1.5배로 추정
                "predicted_o3": round(0.05 + prediction / 1000, 3),  # 오존 농도
                "predicted_no2": round(0.02 + prediction / 2000, 3),  # 이산화질소
                "air_quality_index": calculate_aqi(prediction),
                "grade": get_air_quality_grade(prediction),
                "confidence": round(confidence, 3),
                "prediction_time": prediction_time.isoformat()
            })
        
        return predictions
        
    except Exception as e:
        logger.error(f"예측 수행 실패: {e}")
        raise HTTPException(status_code=500, detail=f"예측 수행 실패: {e}")

def calculate_aqi(pm25: float) -> int:
    """PM2.5 값으로부터 대기질 지수 계산"""
    if pm25 <= 15:
        return int(50 * pm25 / 15)
    elif pm25 <= 35:
        return int(50 + 50 * (pm25 - 15) / 20)
    elif pm25 <= 75:
        return int(100 + 50 * (pm25 - 35) / 40)
    elif pm25 <= 150:
        return int(150 + 50 * (pm25 - 75) / 75)
    else:
        return int(200 + 100 * (pm25 - 150) / 150)

def get_air_quality_grade(pm25: float) -> str:
    """PM2.5 값으로부터 대기질 등급 계산"""
    if pm25 <= 15:
        return "good"
    elif pm25 <= 35:
        return "moderate"
    elif pm25 <= 75:
        return "unhealthy"
    elif pm25 <= 150:
        return "very_unhealthy"
    else:
        return "hazardous"

# API 엔드포인트
@app.get("/health")
async def health_check():
    """서비스 상태 확인"""
    return {
        "status": "healthy",
        "model_loaded": model_loaded,
        "timestamp": datetime.now()
    }

@app.get("/api/v1/models/status", response_model=ModelStatus)
async def get_model_status():
    """모델 상태 조회"""
    return ModelStatus(
        loaded=model_loaded,
        model_version="v1.0.0",
        last_updated=datetime.now(),
        prediction_count=0  # 실제로는 카운터를 구현해야 함
    )

@app.post("/api/v1/predict", response_model=PredictionResponse)
async def predict_air_quality_endpoint(request: PredictionRequest):
    """대기질 예측 API"""
    try:
        if not model_loaded:
            raise HTTPException(status_code=500, detail="모델이 로드되지 않았습니다.")
        
        # 예측 수행
        predictions = predict_air_quality(
            latitude=request.latitude,
            longitude=request.longitude,
            prediction_hours=request.prediction_hours,
            current_weather=request.current_weather,
            historical_data=request.historical_data
        )
        
        # 전체 신뢰도 계산 (평균)
        avg_confidence = np.mean([p["confidence"] for p in predictions])
        
        return PredictionResponse(
            success=True,
            predictions=predictions,
            confidence=round(avg_confidence, 3),
            model_version="v1.0.0",
            prediction_time=datetime.now(),
            message=f"{request.prediction_hours}시간 예측이 완료되었습니다."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"예측 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/models/reload")
async def reload_model():
    """모델 재로드"""
    try:
        load_model()
        return {
            "success": True,
            "message": "모델이 성공적으로 재로드되었습니다.",
            "timestamp": datetime.now()
        }
    except Exception as e:
        logger.error(f"모델 재로드 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 애플리케이션 생명주기 이벤트
@app.on_event("startup")
async def startup_event():
    """애플리케이션 시작 시 실행"""
    logger.info("AI 예측 서비스를 시작합니다.")
    
    # 모델 로딩
    try:
        load_model()
        logger.info("AI 예측 서비스가 성공적으로 시작되었습니다.")
    except Exception as e:
        logger.error(f"서비스 시작 실패: {e}")
        # 개발 환경에서는 더미 모델로 계속 진행
        logger.info("더미 모델로 서비스를 계속 진행합니다.")

@app.on_event("shutdown")
async def shutdown_event():
    """애플리케이션 종료 시 실행"""
    logger.info("AI 예측 서비스를 종료합니다.")

if __name__ == "__main__":
    import uvicorn
    import os
    
    # Railway 환경변수에서 포트 가져오기, 없으면 기본값 사용
    port = int(os.getenv("PORT", 5002))
    uvicorn.run(app, host="0.0.0.0", port=port)
