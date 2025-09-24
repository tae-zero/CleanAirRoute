"""
API 라우터 모듈
- FastAPI APIRouter를 사용한 엔드포인트 정의
- 각 도메인별 라우터 통합
"""

from .air_quality_router import router as air_quality_router

__all__ = ["air_quality_router"]
