# AI/데이터 모델링 명세서

## 1. 목표 정의

### 1.1 예측 모델 목표
- **예측 대상**: 서울시 25개 행정구역의 PM2.5 농도
- **예측 범위**: 최대 72시간 후까지 1시간 단위 예측
- **정확도 목표**: 
  - MAE (Mean Absolute Error) < 10%
  - RMSE (Root Mean Square Error) < 15%
  - R² Score > 0.85
  - 예측 신뢰도 > 80%

### 1.2 성능 지표
```python
# 성능 평가 지표
class ModelMetrics:
    def __init__(self):
        self.mae_threshold = 0.10      # 10%
        self.rmse_threshold = 0.15     # 15%
        self.r2_threshold = 0.85       # 85%
        self.confidence_threshold = 0.80  # 80%
    
    def evaluate_model(self, y_true, y_pred):
        mae = mean_absolute_error(y_true, y_pred)
        rmse = sqrt(mean_squared_error(y_true, y_pred))
        r2 = r2_score(y_true, y_pred)
        
        return {
            'mae': mae,
            'rmse': rmse,
            'r2': r2,
            'mae_pass': mae < self.mae_threshold,
            'rmse_pass': rmse < self.rmse_threshold,
            'r2_pass': r2 > self.r2_threshold
        }
```

## 2. 데이터 소스

### 2.1 주요 데이터 소스

#### 2.1.1 에어코리아 (AirKorea)
```python
# 데이터 소스 설정
AIRKOREA_CONFIG = {
    'base_url': 'http://apis.data.go.kr/B552584/ArpltnInforInqireSvc',
    'api_key': 'YOUR_API_KEY',
    'stations': {
        'seoul': [
            '111121', '111123', '111131', '111141', '111151',  # 강남구
            '111161', '111171', '111181', '111191', '111201',  # 강동구
            # ... 총 25개 구역별 측정소
        ]
    },
    'pollutants': ['PM2.5', 'PM10', 'O3', 'NO2', 'CO', 'SO2'],
    'update_interval': '1hour'
}
```

#### 2.1.2 기상청 (KMA)
```python
KMA_CONFIG = {
    'base_url': 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0',
    'api_key': 'YOUR_API_KEY',
    'weather_params': [
        'TMP',    # 기온
        'REH',    # 습도
        'WSD',    # 풍속
        'VEC',    # 풍향
        'PCP',    # 강수량
        'SNO',    # 적설량
        'SKY',    # 하늘상태
        'PTY'     # 강수형태
    ],
    'forecast_hours': 72
}
```

### 2.2 주요 피처 (Features)

#### 2.2.1 대기질 피처
```python
# 대기질 관련 피처
AIR_QUALITY_FEATURES = {
    'current': [
        'pm25', 'pm10', 'o3', 'no2', 'co', 'so2',
        'pm25_1h_avg', 'pm25_24h_avg',  # 이동평균
        'pm25_trend',  # 추세 (증가/감소)
        'air_quality_index'
    ],
    'historical': [
        'pm25_lag_1h', 'pm25_lag_2h', 'pm25_lag_6h', 'pm25_lag_12h', 'pm25_lag_24h',
        'pm25_weekly_avg', 'pm25_monthly_avg',
        'pm25_std_24h',  # 24시간 표준편차
        'pm25_percentile_75', 'pm25_percentile_90'  # 백분위수
    ]
}
```

#### 2.2.2 기상 피처
```python
# 기상 관련 피처
WEATHER_FEATURES = {
    'current': [
        'temperature', 'humidity', 'wind_speed', 'wind_direction',
        'precipitation', 'snowfall', 'sky_condition', 'precipitation_type'
    ],
    'forecast': [
        'temp_forecast_1h', 'temp_forecast_6h', 'temp_forecast_12h',
        'wind_forecast_1h', 'wind_forecast_6h', 'wind_forecast_12h',
        'precip_forecast_1h', 'precip_forecast_6h', 'precip_forecast_12h'
    ],
    'derived': [
        'temperature_diff_24h',  # 24시간 기온 변화
        'humidity_trend',        # 습도 추세
        'wind_speed_avg_6h',     # 6시간 평균 풍속
        'precipitation_intensity'  # 강수 강도
    ]
}
```

#### 2.2.3 시간 및 공간 피처
```python
# 시간 및 공간 피처
TEMPORAL_SPATIAL_FEATURES = {
    'temporal': [
        'hour', 'day_of_week', 'month', 'season',
        'is_weekend', 'is_holiday',
        'sunrise_hour', 'sunset_hour',
        'daylight_hours'
    ],
    'spatial': [
        'district_id', 'district_name',
        'latitude', 'longitude',
        'elevation', 'distance_to_center',
        'population_density', 'traffic_density',
        'industrial_area_ratio', 'green_area_ratio'
    ],
    'interaction': [
        'district_hour_interaction',  # 구역-시간 상호작용
        'weather_district_interaction'  # 기상-구역 상호작용
    ]
}
```

## 3. 모델링 과정

### 3.1 데이터 전처리

#### 3.1.1 데이터 수집 및 정제
```python
# data_preprocessing/data_collector.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import requests

class DataCollector:
    def __init__(self, config):
        self.airkorea_config = config['airkorea']
        self.kma_config = config['kma']
    
    def collect_air_quality_data(self, start_date, end_date):
        """에어코리아에서 대기질 데이터 수집"""
        all_data = []
        
        for station_id in self.airkorea_config['stations']['seoul']:
            for date in pd.date_range(start_date, end_date, freq='D'):
                data = self._fetch_daily_air_quality(station_id, date)
                all_data.extend(data)
        
        return pd.DataFrame(all_data)
    
    def collect_weather_data(self, start_date, end_date):
        """기상청에서 기상 데이터 수집"""
        all_data = []
        
        for date in pd.date_range(start_date, end_date, freq='D'):
            data = self._fetch_daily_weather(date)
            all_data.extend(data)
        
        return pd.DataFrame(all_data)
    
    def _fetch_daily_air_quality(self, station_id, date):
        # API 호출 로직
        pass
    
    def _fetch_daily_weather(self, date):
        # API 호출 로직
        pass
```

#### 3.1.2 데이터 정제 및 검증
```python
# data_preprocessing/data_cleaner.py
class DataCleaner:
    def __init__(self):
        self.air_quality_limits = {
            'pm25': {'min': 0, 'max': 500},
            'pm10': {'min': 0, 'max': 1000},
            'o3': {'min': 0, 'max': 0.5},
            'no2': {'min': 0, 'max': 1.0}
        }
    
    def clean_air_quality_data(self, df):
        """대기질 데이터 정제"""
        # 1. 이상치 제거
        for pollutant, limits in self.air_quality_limits.items():
            df = df[(df[pollutant] >= limits['min']) & 
                   (df[pollutant] <= limits['max'])]
        
        # 2. 결측값 처리
        df = self._handle_missing_values(df)
        
        # 3. 중복값 제거
        df = df.drop_duplicates(subset=['station_id', 'measured_at'])
        
        return df
    
    def _handle_missing_values(self, df):
        """결측값 처리"""
        # 시계열 보간법 사용
        for col in ['pm25', 'pm10', 'o3', 'no2']:
            df[col] = df.groupby('station_id')[col].transform(
                lambda x: x.interpolate(method='time')
            )
        
        return df
```

### 3.2 피처 엔지니어링

#### 3.2.1 시계열 피처 생성
```python
# feature_engineering/temporal_features.py
class TemporalFeatureEngineer:
    def __init__(self):
        self.lag_periods = [1, 2, 6, 12, 24]  # 시간
        self.rolling_windows = [6, 12, 24]     # 시간
    
    def create_lag_features(self, df, target_col='pm25'):
        """지연 피처 생성"""
        for lag in self.lag_periods:
            df[f'{target_col}_lag_{lag}h'] = df.groupby('station_id')[target_col].shift(lag)
        
        return df
    
    def create_rolling_features(self, df, target_col='pm25'):
        """이동평균 피처 생성"""
        for window in self.rolling_windows:
            df[f'{target_col}_rolling_{window}h_mean'] = df.groupby('station_id')[target_col].rolling(
                window=window, min_periods=1
            ).mean().reset_index(0, drop=True)
            
            df[f'{target_col}_rolling_{window}h_std'] = df.groupby('station_id')[target_col].rolling(
                window=window, min_periods=1
            ).std().reset_index(0, drop=True)
        
        return df
    
    def create_trend_features(self, df, target_col='pm25'):
        """추세 피처 생성"""
        # 1시간 변화율
        df[f'{target_col}_trend_1h'] = df.groupby('station_id')[target_col].diff(1)
        
        # 6시간 변화율
        df[f'{target_col}_trend_6h'] = df.groupby('station_id')[target_col].diff(6)
        
        return df
```

#### 3.2.2 공간 피처 생성
```python
# feature_engineering/spatial_features.py
class SpatialFeatureEngineer:
    def __init__(self):
        self.seoul_districts = {
            'gangnam': {'lat': 37.5172, 'lng': 127.0473},
            'gangdong': {'lat': 37.5301, 'lng': 127.1238},
            # ... 25개 구역 좌표
        }
    
    def create_spatial_features(self, df):
        """공간 피처 생성"""
        # 1. 구역별 인코딩
        df['district_encoded'] = pd.Categorical(df['district']).codes
        
        # 2. 중심점으로부터의 거리
        center_lat, center_lng = 37.5665, 126.9780  # 서울시청
        df['distance_to_center'] = np.sqrt(
            (df['latitude'] - center_lat)**2 + (df['longitude'] - center_lng)**2
        )
        
        # 3. 인접 구역의 대기질 영향
        df = self._create_neighbor_features(df)
        
        return df
    
    def _create_neighbor_features(self, df):
        """인접 구역 피처 생성"""
        # 각 구역의 인접 구역 정의
        neighbors = {
            'gangnam': ['seocho', 'songpa', 'gangdong'],
            'seocho': ['gangnam', 'dongjak', 'gwanak'],
            # ... 인접 구역 매핑
        }
        
        for district, neighbor_list in neighbors.items():
            neighbor_data = df[df['district'].isin(neighbor_list)]
            neighbor_avg = neighbor_data.groupby('measured_at')['pm25'].mean()
            
            df[f'{district}_neighbor_pm25_avg'] = df['measured_at'].map(neighbor_avg)
        
        return df
```

### 3.3 모델 선택 및 구현

#### 3.3.1 LSTM 모델
```python
# models/lstm_model.py
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

class AirQualityLSTM(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, output_size, dropout=0.2):
        super(AirQualityLSTM, self).__init__()
        
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        # LSTM 레이어
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        # 완전연결 레이어
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size // 2, output_size)
        )
    
    def forward(self, x):
        # LSTM 순전파
        lstm_out, (hidden, cell) = self.lstm(x)
        
        # 마지막 시점의 출력 사용
        output = self.fc(lstm_out[:, -1, :])
        
        return output
    
    def predict_sequence(self, x, sequence_length=72):
        """72시간 예측"""
        predictions = []
        current_input = x
        
        for _ in range(sequence_length):
            with torch.no_grad():
                pred = self.forward(current_input)
                predictions.append(pred)
                
                # 다음 입력을 위해 예측값을 추가
                current_input = torch.cat([
                    current_input[:, 1:, :],  # 기존 시퀀스에서 첫 번째 제거
                    pred.unsqueeze(1)  # 예측값을 마지막에 추가
                ], dim=1)
        
        return torch.cat(predictions, dim=1)
```

#### 3.3.2 GRU 모델
```python
# models/gru_model.py
class AirQualityGRU(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, output_size, dropout=0.2):
        super(AirQualityGRU, self).__init__()
        
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        # GRU 레이어
        self.gru = nn.GRU(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        # 어텐션 메커니즘
        self.attention = nn.MultiheadAttention(
            embed_dim=hidden_size,
            num_heads=8,
            dropout=dropout
        )
        
        # 완전연결 레이어
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size // 2, output_size)
        )
    
    def forward(self, x):
        # GRU 순전파
        gru_out, hidden = self.gru(x)
        
        # 어텐션 적용
        attn_out, _ = self.attention(
            gru_out.transpose(0, 1),
            gru_out.transpose(0, 1),
            gru_out.transpose(0, 1)
        )
        
        # 마지막 시점의 출력 사용
        output = self.fc(attn_out[-1])
        
        return output
```

#### 3.3.3 앙상블 모델
```python
# models/ensemble_model.py
class EnsembleModel:
    def __init__(self, models, weights=None):
        self.models = models
        self.weights = weights or [1.0 / len(models)] * len(models)
    
    def predict(self, x):
        predictions = []
        
        for model in self.models:
            pred = model.predict(x)
            predictions.append(pred)
        
        # 가중 평균
        ensemble_pred = np.average(predictions, axis=0, weights=self.weights)
        
        return ensemble_pred
    
    def predict_with_confidence(self, x):
        predictions = []
        
        for model in self.models:
            pred = model.predict(x)
            predictions.append(pred)
        
        # 예측값과 신뢰도 계산
        mean_pred = np.mean(predictions, axis=0)
        std_pred = np.std(predictions, axis=0)
        confidence = 1.0 / (1.0 + std_pred)  # 표준편차가 낮을수록 높은 신뢰도
        
        return mean_pred, confidence
```

### 3.4 학습 및 검증

#### 3.4.1 데이터 분할
```python
# training/data_split.py
from sklearn.model_selection import TimeSeriesSplit

class TimeSeriesDataSplitter:
    def __init__(self, n_splits=5):
        self.n_splits = n_splits
        self.tscv = TimeSeriesSplit(n_splits=n_splits)
    
    def split_data(self, X, y):
        """시계열 데이터 분할"""
        splits = []
        
        for train_idx, val_idx in self.tscv.split(X):
            X_train, X_val = X[train_idx], X[val_idx]
            y_train, y_val = y[train_idx], y[val_idx]
            
            splits.append({
                'X_train': X_train,
                'X_val': X_val,
                'y_train': y_train,
                'y_val': y_val
            })
        
        return splits
```

#### 3.4.2 모델 학습
```python
# training/trainer.py
import torch.optim as optim
from torch.utils.data import DataLoader

class ModelTrainer:
    def __init__(self, model, device='cuda' if torch.cuda.is_available() else 'cpu'):
        self.model = model
        self.device = device
        self.model.to(device)
        
        # 옵티마이저 및 손실 함수
        self.optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-5)
        self.criterion = nn.MSELoss()
        self.scheduler = optim.lr_scheduler.ReduceLROnPlateau(
            self.optimizer, mode='min', factor=0.5, patience=10
        )
    
    def train_epoch(self, dataloader):
        """한 에포크 학습"""
        self.model.train()
        total_loss = 0
        
        for batch_x, batch_y in dataloader:
            batch_x, batch_y = batch_x.to(self.device), batch_y.to(self.device)
            
            # 순전파
            self.optimizer.zero_grad()
            outputs = self.model(batch_x)
            loss = self.criterion(outputs, batch_y)
            
            # 역전파
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
            self.optimizer.step()
            
            total_loss += loss.item()
        
        return total_loss / len(dataloader)
    
    def validate(self, dataloader):
        """검증"""
        self.model.eval()
        total_loss = 0
        
        with torch.no_grad():
            for batch_x, batch_y in dataloader:
                batch_x, batch_y = batch_x.to(self.device), batch_y.to(self.device)
                outputs = self.model(batch_x)
                loss = self.criterion(outputs, batch_y)
                total_loss += loss.item()
        
        return total_loss / len(dataloader)
    
    def train(self, train_loader, val_loader, epochs=100, patience=20):
        """전체 학습 과정"""
        best_val_loss = float('inf')
        patience_counter = 0
        
        for epoch in range(epochs):
            train_loss = self.train_epoch(train_loader)
            val_loss = self.validate(val_loader)
            
            self.scheduler.step(val_loss)
            
            print(f'Epoch {epoch+1}/{epochs}:')
            print(f'  Train Loss: {train_loss:.4f}')
            print(f'  Val Loss: {val_loss:.4f}')
            
            # 조기 종료
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                patience_counter = 0
                # 모델 저장
                torch.save(self.model.state_dict(), 'best_model.pth')
            else:
                patience_counter += 1
                if patience_counter >= patience:
                    print(f'Early stopping at epoch {epoch+1}')
                    break
```

### 3.5 모델 서빙

#### 3.5.1 모델 로딩 및 예측
```python
# serving/model_serving.py
import joblib
import torch
import numpy as np
from typing import Dict, List, Tuple

class ModelServer:
    def __init__(self, model_path: str, scaler_path: str):
        self.model = self._load_model(model_path)
        self.scaler = joblib.load(scaler_path)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    def _load_model(self, model_path: str):
        """모델 로딩"""
        model = AirQualityLSTM(
            input_size=50,  # 피처 수
            hidden_size=128,
            num_layers=2,
            output_size=1
        )
        model.load_state_dict(torch.load(model_path, map_location=self.device))
        model.eval()
        return model
    
    def predict(self, features: np.ndarray, horizon: int = 72) -> Dict:
        """예측 수행"""
        # 데이터 전처리
        features_scaled = self.scaler.transform(features)
        features_tensor = torch.FloatTensor(features_scaled).unsqueeze(0).to(self.device)
        
        # 예측 수행
        with torch.no_grad():
            predictions = self.model.predict_sequence(features_tensor, horizon)
            predictions = predictions.cpu().numpy().flatten()
        
        # 후처리
        predictions_original = self.scaler.inverse_transform(
            predictions.reshape(-1, 1)
        ).flatten()
        
        # 신뢰도 계산 (간단한 방법)
        confidence = self._calculate_confidence(predictions_original)
        
        return {
            'predictions': predictions_original.tolist(),
            'confidence': confidence,
            'horizon': horizon,
            'timestamp': datetime.now().isoformat()
        }
    
    def _calculate_confidence(self, predictions: np.ndarray) -> float:
        """예측 신뢰도 계산"""
        # 예측값의 변동성 기반 신뢰도 계산
        std_dev = np.std(predictions)
        confidence = max(0.0, min(1.0, 1.0 - (std_dev / np.mean(predictions))))
        return confidence
```

#### 3.5.2 배치 예측
```python
# serving/batch_predictor.py
class BatchPredictor:
    def __init__(self, model_server: ModelServer):
        self.model_server = model_server
    
    def predict_batch(self, batch_data: List[Dict]) -> List[Dict]:
        """배치 예측"""
        results = []
        
        for data in batch_data:
            try:
                prediction = self.model_server.predict(
                    features=data['features'],
                    horizon=data.get('horizon', 72)
                )
                results.append({
                    'station_id': data['station_id'],
                    'prediction': prediction,
                    'status': 'success'
                })
            except Exception as e:
                results.append({
                    'station_id': data['station_id'],
                    'error': str(e),
                    'status': 'error'
                })
        
        return results
```

## 4. 모델 모니터링 및 재학습

### 4.1 모델 성능 모니터링
```python
# monitoring/model_monitor.py
class ModelMonitor:
    def __init__(self, model_server: ModelServer):
        self.model_server = model_server
        self.performance_history = []
    
    def monitor_performance(self, actual_values: np.ndarray, 
                          predicted_values: np.ndarray) -> Dict:
        """모델 성능 모니터링"""
        mae = np.mean(np.abs(actual_values - predicted_values))
        rmse = np.sqrt(np.mean((actual_values - predicted_values)**2))
        mape = np.mean(np.abs((actual_values - predicted_values) / actual_values)) * 100
        
        performance = {
            'mae': mae,
            'rmse': rmse,
            'mape': mape,
            'timestamp': datetime.now().isoformat()
        }
        
        self.performance_history.append(performance)
        
        # 성능 저하 감지
        if self._detect_performance_degradation():
            self._trigger_retraining()
        
        return performance
    
    def _detect_performance_degradation(self) -> bool:
        """성능 저하 감지"""
        if len(self.performance_history) < 10:
            return False
        
        recent_mae = np.mean([p['mae'] for p in self.performance_history[-5:]])
        historical_mae = np.mean([p['mae'] for p in self.performance_history[-20:-5]])
        
        # MAE가 20% 이상 증가하면 성능 저하로 판단
        return recent_mae > historical_mae * 1.2
    
    def _trigger_retraining(self):
        """재학습 트리거"""
        # 재학습 작업을 큐에 추가
        pass
```

### 4.2 자동 재학습 파이프라인
```python
# retraining/auto_retrain.py
class AutoRetrainer:
    def __init__(self, data_collector: DataCollector, trainer: ModelTrainer):
        self.data_collector = data_collector
        self.trainer = trainer
    
    def retrain_model(self, days_back: int = 30):
        """모델 자동 재학습"""
        # 1. 최신 데이터 수집
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        
        air_quality_data = self.data_collector.collect_air_quality_data(
            start_date, end_date
        )
        weather_data = self.data_collector.collect_weather_data(
            start_date, end_date
        )
        
        # 2. 데이터 전처리
        processed_data = self._preprocess_data(air_quality_data, weather_data)
        
        # 3. 모델 재학습
        new_model = self.trainer.train(processed_data)
        
        # 4. 성능 검증
        if self._validate_new_model(new_model):
            # 5. 모델 배포
            self._deploy_model(new_model)
            return True
        
        return False
    
    def _validate_new_model(self, model) -> bool:
        """새 모델 검증"""
        # 검증 데이터셋으로 성능 테스트
        # 기존 모델 대비 성능 개선 확인
        pass
    
    def _deploy_model(self, model):
        """모델 배포"""
        # 새 모델을 프로덕션 환경에 배포
        pass
```

이 AI/데이터 모델링 명세서는 정확하고 신뢰할 수 있는 대기질 예측 모델을 구축하고 운영하기 위한 종합적인 접근 방식을 제시합니다.
