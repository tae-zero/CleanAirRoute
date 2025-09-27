#!/bin/bash

# CleanAir Route Frontend Setup Script

echo "🚀 CleanAir Route Frontend 설정을 시작합니다..."

# Node.js 버전 확인
echo "📋 Node.js 버전 확인 중..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다. Node.js 18+ 버전을 설치해주세요."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ 버전이 필요합니다. 현재 버전: $(node -v)"
    exit 1
fi

echo "✅ Node.js 버전: $(node -v)"

# npm 버전 확인
echo "📋 npm 버전 확인 중..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm이 설치되어 있지 않습니다."
    exit 1
fi

echo "✅ npm 버전: $(npm -v)"

# 의존성 설치
echo "📦 의존성 설치 중..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 의존성 설치에 실패했습니다."
    exit 1
fi

echo "✅ 의존성 설치 완료"

# 환경 변수 파일 확인
echo "🔧 환경 변수 설정 확인 중..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local 파일이 없습니다. .env.example을 복사하여 생성합니다."
    cp .env.example .env.local
    echo "📝 .env.local 파일을 생성했습니다. 필요한 환경 변수를 설정해주세요."
    echo "   - NEXT_PUBLIC_KAKAO_MAP_KEY: Kakao Maps API 키"
    echo "   - NEXT_PUBLIC_API_URL: 백엔드 API URL"
else
    echo "✅ .env.local 파일이 존재합니다."
fi

# TypeScript 타입 체크
echo "🔍 TypeScript 타입 체크 중..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  TypeScript 타입 체크에서 오류가 발견되었습니다."
    echo "   개발을 계속 진행할 수 있지만, 타입 오류를 수정하는 것을 권장합니다."
fi

# ESLint 체크
echo "🔍 ESLint 체크 중..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️  ESLint에서 오류가 발견되었습니다."
    echo "   코드 품질을 위해 린트 오류를 수정하는 것을 권장합니다."
fi

echo ""
echo "🎉 CleanAir Route Frontend 설정이 완료되었습니다!"
echo ""
echo "📋 다음 단계:"
echo "1. .env.local 파일에서 환경 변수를 설정하세요"
echo "2. 'npm run dev' 명령어로 개발 서버를 시작하세요"
echo "3. 브라우저에서 http://localhost:3000 을 열어 확인하세요"
echo ""
echo "🔧 유용한 명령어:"
echo "  npm run dev          # 개발 서버 시작"
echo "  npm run build        # 프로덕션 빌드"
echo "  npm run lint         # 코드 린팅"
echo "  npm run type-check   # 타입 체크"
echo "  npm test             # 테스트 실행"
echo ""
