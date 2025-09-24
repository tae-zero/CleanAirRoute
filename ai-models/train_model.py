"""
대기질 예측을 위한 LSTM 모델 학습 스크립트
- 시계열 데이터 분석 및 예측 모델링
- TensorFlow/Keras를 사용한 LSTM 모델 구현
- 데이터 전처리, 모델 학습, 검증, 저장
"""

import pandas as pd
import numpy as np
import logging
from datetime import datetime, timedelta
from typing import Tuple, List
import os

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 설정
SEQUENCE_LENGTH = 24  # 과거 24시간 데이터로 예측
PREDICTION_HOURS = 1  # 1시간 후 예측
TEST_SIZE = 0.2
VALIDATION_SIZE = 0.2
RANDOM_STATE = 42

class AirQualityModelTrainer:
    """대기질 예측 모델 학습 클래스"""
    
    def __init__(self, data_path: str = "air_quality_data.csv"):
        self.data_path = data_path
        self.scaler = MinMaxScaler()
        self.model = None
        self.history = None
        
    def load_and_preprocess_data(self) -> pd.DataFrame:
        """
        CSV 파일을 로드하고 전처리
        """
        logger.info("데이터 로딩 및 전처리를 시작합니다.")
        
        try:
            # CSV 파일 로드
            if os.path.exists(self.data_path):
                df = pd.read_csv(self.data_path)
                logger.info(f"데이터 파일을 성공적으로 로드했습니다: {len(df)}개 행")
            else:
                # 실제 데이터가 없는 경우 더미 데이터 생성
                logger.warning("실제 데이터 파일이 없습니다. 더미 데이터를 생성합니다.")
                df = self.generate_dummy_data()
            
            # timestamp를 datetime으로 변환
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            # 데이터 정렬 (시간순)
            df = df.sort_values('timestamp').reset_index(drop=True)
            
            # 결측값 처리
            df = df.fillna(method='ffill').fillna(method='bfill')
            
            # 이상치 제거 (IQR 방법)
            for column in ['pm25', 'temperature', 'wind_speed']:
                if column in df.columns:
                    Q1 = df[column].quantile(0.25)
                    Q3 = df[column].quantile(0.75)
                    IQR = Q3 - Q1
                    lower_bound = Q1 - 1.5 * IQR
                    upper_bound = Q3 + 1.5 * IQR
                    df = df[(df[column] >= lower_bound) & (df[column] <= upper_bound)]
            
            logger.info(f"전처리 완료: {len(df)}개 행")
            return df
            
        except Exception as e:
            logger.error(f"데이터 로딩 및 전처리 실패: {e}")
            raise
    
    def generate_dummy_data(self) -> pd.DataFrame:
        """
        개발용 더미 데이터 생성
        """
        logger.info("더미 데이터를 생성합니다.")
        
        # 1년치 시간 데이터 생성 (1시간 간격)
        start_date = datetime.now() - timedelta(days=365)
        timestamps = pd.date_range(start=start_date, periods=8760, freq='H')
        
        # 더미 데이터 생성
        np.random.seed(42)
        data = []
        
        for i, timestamp in enumerate(timestamps):
            # 계절성 반영
            hour = timestamp.hour
            day_of_year = timestamp.timetuple().tm_yday
            
            # 기본 PM2.5 값 (계절성 + 시간성 반영)
            base_pm25 = 25 + 10 * np.sin(2 * np.pi * day_of_year / 365)  # 계절성
            base_pm25 += 5 * np.sin(2 * np.pi * hour / 24)  # 시간성
            base_pm25 += np.random.normal(0, 5)  # 랜덤 노이즈
            
            # 기온 (계절성 반영)
            temperature = 15 + 15 * np.sin(2 * np.pi * day_of_year / 365) + np.random.normal(0, 2)
            
            # 풍속 (계절성 반영)
            wind_speed = 2 + 1 * np.sin(2 * np.pi * day_of_year / 365) + np.random.normal(0, 0.5)
            wind_speed = max(0, wind_speed)  # 음수 방지
            
            data.append({
                'timestamp': timestamp,
                'pm25': max(0, base_pm25),  # 음수 방지
                'temperature': temperature,
                'wind_speed': wind_speed
            })
        
        df = pd.DataFrame(data)
        logger.info(f"더미 데이터 생성 완료: {len(df)}개 행")
        return df
    
    def create_sequences(self, data: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        시계열 데이터를 LSTM 모델에 입력할 수 있는 형태로 변환
        과거 24시간 데이터로 다음 1시간을 예측
        """
        logger.info("시계열 시퀀스를 생성합니다.")
        
        # 피처 선택
        feature_columns = ['pm25', 'temperature', 'wind_speed']
        features = data[feature_columns].values
        
        # 데이터 정규화
        features_scaled = self.scaler.fit_transform(features)
        
        # 시퀀스 생성
        X, y = [], []
        
        for i in range(SEQUENCE_LENGTH, len(features_scaled) - PREDICTION_HOURS + 1):
            # 입력 시퀀스 (과거 24시간)
            X.append(features_scaled[i-SEQUENCE_LENGTH:i])
            # 타겟 (1시간 후 PM2.5)
            y.append(features_scaled[i+PREDICTION_HOURS-1, 0])  # PM2.5는 첫 번째 컬럼
        
        X = np.array(X)
        y = np.array(y)
        
        logger.info(f"시퀀스 생성 완료: X shape {X.shape}, y shape {y.shape}")
        return X, y
    
    def build_model(self, input_shape: Tuple[int, int]) -> Sequential:
        """
        LSTM 모델 아키텍처 정의
        """
        logger.info("LSTM 모델을 구축합니다.")
        
        model = Sequential([
            # 첫 번째 LSTM 레이어
            LSTM(50, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            
            # 두 번째 LSTM 레이어
            LSTM(50, return_sequences=True),
            Dropout(0.2),
            
            # 세 번째 LSTM 레이어
            LSTM(50, return_sequences=False),
            Dropout(0.2),
            
            # 완전연결 레이어
            Dense(25, activation='relu'),
            Dropout(0.2),
            
            # 출력 레이어
            Dense(1, activation='linear')
        ])
        
        # 모델 컴파일
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )
        
        logger.info("모델 구축 완료")
        return model
    
    def train_model(self, X: np.ndarray, y: np.ndarray) -> None:
        """
        모델 학습
        """
        logger.info("모델 학습을 시작합니다.")
        
        # 데이터 분할
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y, test_size=TEST_SIZE + VALIDATION_SIZE, random_state=RANDOM_STATE
        )
        
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=TEST_SIZE/(TEST_SIZE + VALIDATION_SIZE), random_state=RANDOM_STATE
        )
        
        logger.info(f"데이터 분할 완료:")
        logger.info(f"  훈련 세트: {X_train.shape[0]}개")
        logger.info(f"  검증 세트: {X_val.shape[0]}개")
        logger.info(f"  테스트 세트: {X_test.shape[0]}개")
        
        # 모델 구축
        self.model = self.build_model((X_train.shape[1], X_train.shape[2]))
        
        # 콜백 설정
        callbacks = [
            EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True,
                verbose=1
            ),
            ModelCheckpoint(
                'best_model.h5',
                monitor='val_loss',
                save_best_only=True,
                verbose=1
            )
        ]
        
        # 모델 학습
        self.history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=100,
            batch_size=32,
            callbacks=callbacks,
            verbose=1
        )
        
        # 테스트 세트로 최종 평가
        test_loss, test_mae = self.model.evaluate(X_test, y_test, verbose=0)
        logger.info(f"테스트 세트 성능: Loss={test_loss:.4f}, MAE={test_mae:.4f}")
        
        # 예측 및 성능 지표 계산
        y_pred = self.model.predict(X_test)
        self.evaluate_model(y_test, y_pred)
    
    def evaluate_model(self, y_true: np.ndarray, y_pred: np.ndarray) -> None:
        """
        모델 성능 평가
        """
        logger.info("모델 성능을 평가합니다.")
        
        # 역정규화 (원래 스케일로 변환)
        y_true_original = self.scaler.inverse_transform(
            np.column_stack([y_true, np.zeros_like(y_true), np.zeros_like(y_true)])
        )[:, 0]
        
        y_pred_original = self.scaler.inverse_transform(
            np.column_stack([y_pred.flatten(), np.zeros_like(y_pred.flatten()), np.zeros_like(y_pred.flatten())])
        )[:, 0]
        
        # 성능 지표 계산
        mae = mean_absolute_error(y_true_original, y_pred_original)
        mse = mean_squared_error(y_true_original, y_pred_original)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_true_original, y_pred_original)
        
        # MAE 백분율 계산
        mae_percentage = (mae / np.mean(y_true_original)) * 100
        
        logger.info("=== 모델 성능 평가 결과 ===")
        logger.info(f"MAE (Mean Absolute Error): {mae:.4f}")
        logger.info(f"MAE 백분율: {mae_percentage:.2f}%")
        logger.info(f"MSE (Mean Squared Error): {mse:.4f}")
        logger.info(f"RMSE (Root Mean Squared Error): {rmse:.4f}")
        logger.info(f"R² Score: {r2:.4f}")
        
        # 목표 달성 여부 확인
        if mae_percentage <= 10:
            logger.info("✅ 목표 달성: MAE 10% 이내")
        else:
            logger.warning(f"⚠️ 목표 미달성: MAE {mae_percentage:.2f}% (목표: 10% 이내)")
        
        if r2 >= 0.85:
            logger.info("✅ 목표 달성: R² 0.85 이상")
        else:
            logger.warning(f"⚠️ 목표 미달성: R² {r2:.4f} (목표: 0.85 이상)")
    
    def save_model(self) -> None:
        """
        학습된 모델과 스케일러 저장
        """
        logger.info("모델과 스케일러를 저장합니다.")
        
        try:
            # 모델 저장 (TensorFlow 형식)
            self.model.save('model.h5')
            logger.info("모델이 model.h5로 저장되었습니다.")
            
            # 모델 저장 (pickle 형식 - 호환성을 위해)
            with open('model.pkl', 'wb') as f:
                import pickle
                pickle.dump(self.model, f)
            logger.info("모델이 model.pkl로 저장되었습니다.")
            
            # 스케일러 저장
            joblib.dump(self.scaler, 'scaler.pkl')
            logger.info("스케일러가 scaler.pkl로 저장되었습니다.")
            
            # 학습 히스토리 저장
            if self.history:
                import json
                history_dict = {
                    'loss': self.history.history['loss'],
                    'val_loss': self.history.history['val_loss'],
                    'mae': self.history.history['mae'],
                    'val_mae': self.history.history['val_mae']
                }
                with open('training_history.json', 'w') as f:
                    json.dump(history_dict, f)
                logger.info("학습 히스토리가 training_history.json으로 저장되었습니다.")
            
        except Exception as e:
            logger.error(f"모델 저장 실패: {e}")
            raise
    
    def run_training_pipeline(self) -> None:
        """
        전체 학습 파이프라인 실행
        """
        logger.info("=== 대기질 예측 모델 학습 파이프라인 시작 ===")
        
        try:
            # 1. 데이터 로딩 및 전처리
            data = self.load_and_preprocess_data()
            
            # 2. 시계열 시퀀스 생성
            X, y = self.create_sequences(data)
            
            # 3. 모델 학습
            self.train_model(X, y)
            
            # 4. 모델 저장
            self.save_model()
            
            logger.info("=== 모델 학습 파이프라인 완료 ===")
            
        except Exception as e:
            logger.error(f"학습 파이프라인 실패: {e}")
            raise

def main():
    """메인 함수"""
    # 모델 학습기 초기화
    trainer = AirQualityModelTrainer()
    
    # 학습 파이프라인 실행
    trainer.run_training_pipeline()

if __name__ == "__main__":
    main()
