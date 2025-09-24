#!/bin/bash

# CleanAir Route 프로젝트 시작 스크립트

echo "🚀 CleanAir Route 프로젝트를 시작합니다..."

# 환경 변수 파일 확인
if [ ! -f .env ]; then
    echo "⚠️  .env 파일이 없습니다. env.example을 복사하여 .env 파일을 생성하세요."
    echo "   cp env.example .env"
    echo "   그리고 필요한 API 키들을 설정하세요."
    exit 1
fi

# Docker 및 Docker Compose 확인
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되지 않았습니다."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose가 설치되지 않았습니다."
    exit 1
fi

# Docker 서비스 시작
echo "🐳 Docker 서비스를 시작합니다..."
docker-compose up -d

# 서비스 상태 확인
echo "⏳ 서비스가 시작될 때까지 잠시 기다립니다..."
sleep 10

# 헬스체크
echo "🔍 서비스 상태를 확인합니다..."
curl -f http://localhost:8001/health && echo "✅ 데이터 수집 서비스: 정상"
curl -f http://localhost:8002/health && echo "✅ AI 예측 서비스: 정상"
curl -f http://localhost:8003/health && echo "✅ 경로 로직 서비스: 정상"

echo ""
echo "🎉 CleanAir Route 프로젝트가 성공적으로 시작되었습니다!"
echo ""
echo "📋 서비스 정보:"
echo "   - 데이터 수집 서비스: http://localhost:8001"
echo "   - AI 예측 서비스: http://localhost:8002"
echo "   - 경로 로직 서비스: http://localhost:8003"
echo "   - Nginx 프록시: http://localhost:80"
echo ""
echo "📚 API 문서:"
echo "   - 데이터 수집: http://localhost:8001/docs"
echo "   - AI 예측: http://localhost:8002/docs"
echo "   - 경로 로직: http://localhost:8003/docs"
echo ""
echo "🛑 서비스 중지: docker-compose down"
