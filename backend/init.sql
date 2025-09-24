-- CleanAir Route 데이터베이스 초기화 스크립트

-- 대기질 측정 데이터 테이블
CREATE TABLE IF NOT EXISTS air_quality_readings (
    id SERIAL PRIMARY KEY,
    station_id VARCHAR(20) NOT NULL,
    station_name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    measured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    pm25 DECIMAL(6, 2),
    pm10 DECIMAL(6, 2),
    o3 DECIMAL(6, 2),
    no2 DECIMAL(6, 2),
    co DECIMAL(6, 2),
    so2 DECIMAL(6, 2),
    air_quality_index INTEGER,
    grade VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(station_id, measured_at)
);

-- 기상 측정 데이터 테이블
CREATE TABLE IF NOT EXISTS weather_readings (
    id SERIAL PRIMARY KEY,
    station_id VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    measured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    temperature DECIMAL(5, 2),
    humidity DECIMAL(5, 2),
    wind_speed DECIMAL(5, 2),
    wind_direction DECIMAL(5, 2),
    precipitation DECIMAL(6, 2),
    pressure DECIMAL(7, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(station_id, measured_at)
);

-- 예측 데이터 테이블
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    station_id VARCHAR(20) NOT NULL,
    predicted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    prediction_horizon INTEGER NOT NULL,
    pm25_prediction DECIMAL(6, 2),
    pm10_prediction DECIMAL(6, 2),
    o3_prediction DECIMAL(6, 2),
    no2_prediction DECIMAL(6, 2),
    confidence_score DECIMAL(4, 3),
    model_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 정보 테이블
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(100),
    preferred_language VARCHAR(10) DEFAULT 'ko',
    health_conditions JSONB,
    preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 저장된 위치 테이블
CREATE TABLE IF NOT EXISTS saved_locations (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    location_type VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 경로 이력 테이블
CREATE TABLE IF NOT EXISTS route_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    start_latitude DECIMAL(10, 8) NOT NULL,
    start_longitude DECIMAL(11, 8) NOT NULL,
    end_latitude DECIMAL(10, 8) NOT NULL,
    end_longitude DECIMAL(11, 8) NOT NULL,
    route_type VARCHAR(20) NOT NULL,
    total_distance DECIMAL(8, 2),
    total_duration INTEGER,
    air_quality_score DECIMAL(5, 2),
    waypoints JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_air_quality_station_time ON air_quality_readings(station_id, measured_at);
CREATE INDEX IF NOT EXISTS idx_air_quality_measured_at ON air_quality_readings(measured_at);
CREATE INDEX IF NOT EXISTS idx_weather_station_time ON weather_readings(station_id, measured_at);
CREATE INDEX IF NOT EXISTS idx_weather_measured_at ON weather_readings(measured_at);
CREATE INDEX IF NOT EXISTS idx_predictions_station_time ON predictions(station_id, predicted_at);
CREATE INDEX IF NOT EXISTS idx_predictions_horizon ON predictions(prediction_horizon);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_saved_locations_user ON saved_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_route_history_user ON route_history(user_id);
CREATE INDEX IF NOT EXISTS idx_route_history_created_at ON route_history(created_at);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 생성
CREATE TRIGGER update_air_quality_updated_at BEFORE UPDATE ON air_quality_readings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weather_updated_at BEFORE UPDATE ON weather_readings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_locations_updated_at BEFORE UPDATE ON saved_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
