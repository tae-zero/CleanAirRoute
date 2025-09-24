#!/bin/bash

# CleanAir Route 프로젝트 중지 스크립트

echo "🛑 CleanAir Route 프로젝트를 중지합니다..."

# Docker 서비스 중지
docker-compose down

echo "✅ 모든 서비스가 중지되었습니다."
