"""
CleanAir Route API 메인 애플리케이션
- FastAPI 애플리케이션 생성 및 설정
- 미들웨어 및 라우터 등록
- 애플리케이션 생명주기 관리
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import time

from common.config import get_settings
from common.database import Base, engine
from router import air_quality_router

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    애플리케이션 생명주기 관리
    - 시작 시: 데이터베이스 테이블 생성, 초기화 작업
    - 종료 시: 리소스 정리
    """
    # 시작 시 실행
    logger.info("CleanAir Route API를 시작합니다.")
    
    try:
        # 데이터베이스 테이블 생성
        Base.metadata.create_all(bind=engine)
        logger.info("데이터베이스 테이블이 생성되었습니다.")
        
        # TODO: 다른 초기화 작업들
        # - Redis 연결 확인
        # - 외부 서비스 헬스체크
        # - 캐시 워밍업
        
        yield
        
    except Exception as e:
        logger.error(f"애플리케이션 시작 중 오류 발생: {e}")
        raise
    finally:
        # 종료 시 실행
        logger.info("CleanAir Route API를 종료합니다.")
        
        # TODO: 리소스 정리 작업들
        # - 데이터베이스 연결 종료
        # - Redis 연결 종료
        # - 백그라운드 태스크 정리

# FastAPI 애플리케이션 생성
app = FastAPI(
    title="CleanAir Route API",
    description="대기질 기반 경로 추천 서비스 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# 설정 가져오기
settings = get_settings()

# CORS 미들웨어 추가 (프론트엔드 연동을 위해)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 신뢰할 수 있는 호스트 미들웨어 추가
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app", "*.railway.app"]
)

# 요청 로깅 미들웨어
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """요청 로깅 미들웨어"""
    start_time = time.time()
    
    # 요청 로깅
    logger.info(f"요청: {request.method} {request.url}")
    
    # 요청 처리
    response = await call_next(request)
    
    # 응답 로깅
    process_time = time.time() - start_time
    logger.info(f"응답: {response.status_code} - 처리시간: {process_time:.4f}초")
    
    # 응답 헤더에 처리 시간 추가
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

# 라우터 등록
app.include_router(air_quality_router)

# 루트 엔드포인트
@app.get("/")
async def root():
    """
    루트 엔드포인트 - API 정보 반환
    """
    return {
        "message": "Welcome to CleanAir Route API",
        "version": "1.0.0",
        "description": "대기질 기반 경로 추천 서비스",
        "docs": "/docs",
        "health": "/api/v1/health"
    }

# API 정보 엔드포인트
@app.get("/info")
async def api_info():
    """
    API 정보 엔드포인트
    """
    return {
        "name": "CleanAir Route API",
        "version": "1.0.0",
        "description": "대기질 기반 경로 추천 서비스 API",
        "endpoints": {
            "routes": "/api/v1/routes",
            "air_quality": "/api/v1/air-quality",
            "health": "/api/v1/health"
        },
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc",
            "openapi": "/openapi.json"
        }
    }

# 전역 예외 처리기
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """전역 예외 처리기"""
    logger.error(f"전역 예외 발생: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "error_code": "INTERNAL_ERROR",
            "details": {
                "path": str(request.url),
                "method": request.method
            }
        }
    )

# 404 예외 처리기
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: Exception):
    """404 예외 처리기"""
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "message": "Endpoint not found",
            "error_code": "NOT_FOUND",
            "details": {
                "path": str(request.url),
                "method": request.method
            }
        }
    )

if __name__ == "__main__":
    import uvicorn
    import os
    
    # Railway 환경변수에서 포트 가져오기, 없으면 기본값 사용
    port = int(os.getenv("PORT", 5000))
    
    # 개발 서버 실행
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # Railway에서는 reload 비활성화
        log_level="info"
    )
