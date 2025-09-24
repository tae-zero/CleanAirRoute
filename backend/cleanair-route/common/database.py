"""
데이터베이스 연결 및 세션 관리 모듈
- SQLAlchemy를 사용한 데이터베이스 엔진 및 세션 관리
- FastAPI 의존성 주입을 통한 자동 세션 관리
- 프로젝트 전반에서 재사용되는 데이터베이스 관련 기능
"""

import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi import Depends

# 환경 변수에서 데이터베이스 URL 가져오기
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://user:password@localhost:5432/cleanair_route"
)

# SQLAlchemy 엔진 생성
engine = create_engine(
    DATABASE_URL,
    pool_size=20,          # 연결 풀 크기
    max_overflow=30,       # 최대 오버플로우 연결 수
    pool_pre_ping=True,    # 연결 전 ping 확인
    pool_recycle=3600,     # 연결 재활용 시간 (1시간)
    echo=False             # SQL 쿼리 로깅 (개발 시에만 True)
)

# 세션 생성기
SessionLocal = sessionmaker(
    autocommit=False,      # 자동 커밋 비활성화
    autoflush=False,       # 자동 플러시 비활성화
    bind=engine
)

# 모든 테이블의 메타데이터를 관리할 Base 클래스
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI 의존성 주입을 위한 데이터베이스 세션 생성기
    
    각 API 요청마다 독립적인 데이터베이스 세션을 제공하고,
    요청이 끝나면 세션을 자동으로 닫습니다.
    
    Yields:
        Session: SQLAlchemy 데이터베이스 세션
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 의존성 주입을 위한 타입 힌트
DatabaseSession = Depends(get_db)
