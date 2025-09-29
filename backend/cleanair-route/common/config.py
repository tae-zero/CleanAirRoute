"""
설정 관리 모듈
- 환경 변수 관리
- 애플리케이션 설정 중앙화
- 개발/운영 환경별 설정 분리
"""

import os
from typing import Optional, List
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """애플리케이션 설정 클래스"""
    
    # 데이터베이스 설정
    database_url: str = "postgresql://user:password@localhost:5432/cleanair_route"
    
    # Redis 설정
    redis_url: str = "redis://localhost:6379"
    
    # 외부 API 설정
    airkorea_api_key: Optional[str] = None
    kma_api_key: Optional[str] = None
    kakao_map_key: Optional[str] = None
    
    # 서비스 URL 설정
    ai_prediction_service_url: str = "http://localhost:5002"
    data_ingestion_service_url: str = "http://localhost:5001"
    
    # 보안 설정
    secret_key: str = "your-secret-key-here"
    access_token_expire_minutes: int = 30
    
    # 애플리케이션 설정
    app_name: str = "CleanAir Route API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # API 설정
    api_v1_prefix: str = "/api/v1"
    
    # CORS 설정
    allowed_origins: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    @field_validator('allowed_origins', mode='before')
    @classmethod
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            # 빈 문자열이거나 잘못된 형식인 경우 기본값 사용
            if not v or v.strip() == '':
                return ["http://localhost:3000", "http://localhost:3001"]
            
            # @ 기호 제거
            v = v.replace('@', '')
            
            # JSON 형식이 아닌 경우 쉼표로 분리
            if not v.startswith('['):
                return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v
    
    # 로깅 설정
    log_level: str = "INFO"
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": False,
        "extra": "ignore"
    }

# 전역 설정 인스턴스
settings = Settings()

def get_settings() -> Settings:
    """설정 인스턴스를 반환하는 함수 (의존성 주입용)"""
    return settings
