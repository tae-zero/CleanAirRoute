# ▲ Vercel 배포 오류 해결 가이드

## ❌ **발생한 오류**
```
Environment Variable "NEXT_PUBLIC_API_URL" references Secret "next_public_api_url", which does not exist.
```

## 🔧 **해결 방법**

### **1단계: vercel.json 수정 완료**
`vercel.json` 파일에서 `env` 섹션을 제거했습니다. 이제 Vercel 대시보드에서 직접 환경변수를 설정해야 합니다.

### **2단계: Vercel 대시보드에서 환경변수 설정**

#### **Vercel 대시보드 접속**
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 클릭

#### **환경변수 추가**
```bash
# Name: NEXT_PUBLIC_API_URL
# Value: https://your-backend-app.railway.app
# Environment: Production, Preview, Development (모든 환경)

# Name: NEXT_PUBLIC_KAKAO_MAP_KEY
# Value: your_kakao_map_javascript_key_here
# Environment: Production, Preview, Development

# Name: NEXT_PUBLIC_APP_NAME
# Value: CleanAir Route
# Environment: Production, Preview, Development

# Name: NEXT_PUBLIC_APP_VERSION
# Value: 1.0.0
# Environment: Production, Preview, Development

# Name: NEXT_PUBLIC_ENV
# Value: production
# Environment: Production, Preview, Development
```

---

## 🚀 **Vercel 배포 단계**

### **방법 1: Vercel CLI 사용**
```bash
# 1. Vercel CLI 설치
npm install -g vercel

# 2. 로그인
vercel login

# 3. 프로젝트 배포
cd frontend
vercel

# 4. 환경변수 설정
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_KAKAO_MAP_KEY
vercel env add NEXT_PUBLIC_APP_NAME
vercel env add NEXT_PUBLIC_APP_VERSION
vercel env add NEXT_PUBLIC_ENV
```

### **방법 2: GitHub 연동 (권장)**
```bash
# 1. GitHub 저장소에 코드 푸시
git add .
git commit -m "Fix Vercel deployment configuration"
git push origin main

# 2. Vercel 대시보드에서
# - New Project → Import Git Repository
# - Root Directory: frontend
# - Environment Variables 설정
# - Deploy
```

---

## 🔧 **환경변수 설정 상세**

### **Vercel 대시보드에서 설정**
1. **Project Settings** → **Environment Variables**
2. **Add New** 클릭
3. 각 환경변수 추가:

#### **NEXT_PUBLIC_API_URL**
```bash
Name: NEXT_PUBLIC_API_URL
Value: https://your-backend-app.railway.app
Environment: Production, Preview, Development
```

#### **NEXT_PUBLIC_KAKAO_MAP_KEY**
```bash
Name: NEXT_PUBLIC_KAKAO_MAP_KEY
Value: your_kakao_map_javascript_key_here
Environment: Production, Preview, Development
```

#### **NEXT_PUBLIC_APP_NAME**
```bash
Name: NEXT_PUBLIC_APP_NAME
Value: CleanAir Route
Environment: Production, Preview, Development
```

#### **NEXT_PUBLIC_APP_VERSION**
```bash
Name: NEXT_PUBLIC_APP_VERSION
Value: 1.0.0
Environment: Production, Preview, Development
```

#### **NEXT_PUBLIC_ENV**
```bash
Name: NEXT_PUBLIC_ENV
Value: production
Environment: Production, Preview, Development
```

---

## 📊 **Railway 백엔드 URL 확인**

### **Railway 대시보드에서 백엔드 URL 확인**
1. Railway 대시보드 접속
2. 메인 API 서비스 선택
3. **Settings** → **Domains**에서 URL 확인
4. 예시: `https://cleanair-route-production.up.railway.app`

### **NEXT_PUBLIC_API_URL 설정**
```bash
# Railway 백엔드 URL을 Vercel 환경변수에 설정
NEXT_PUBLIC_API_URL=https://cleanair-route-production.up.railway.app
```

---

## 🔄 **배포 후 확인사항**

### **1. 헬스체크**
```bash
# Vercel 프론트엔드
https://your-frontend-app.vercel.app

# Railway 백엔드
https://your-backend-app.railway.app/health
```

### **2. API 연결 테스트**
```bash
# 브라우저 개발자 도구에서
console.log(process.env.NEXT_PUBLIC_API_URL)
```

### **3. CORS 설정 업데이트**
Railway 백엔드의 `ALLOWED_ORIGINS`에 Vercel 도메인 추가:
```bash
ALLOWED_ORIGINS=https://your-frontend-app.vercel.app,http://localhost:3000
```

---

## ⚠️ **주의사항**

### **🔐 보안**
- `NEXT_PUBLIC_` 접두사가 붙은 변수만 공개
- 민감한 정보는 서버사이드에서만 사용
- API 키를 환경변수로 관리

### **🌐 CORS**
- Railway 백엔드에서 Vercel 도메인 허용
- 정확한 도메인만 `ALLOWED_ORIGINS`에 포함

### **🔄 재배포**
- 환경변수 변경 후 재배포 필요
- Vercel은 자동으로 재배포됨

---

## 🎯 **배포 체크리스트**

### **✅ 배포 전 확인사항**
- [ ] Railway 백엔드 배포 완료
- [ ] Railway 백엔드 URL 확인
- [ ] Vercel 환경변수 설정
- [ ] vercel.json 파일 수정 완료

### **✅ 배포 후 확인사항**
- [ ] Vercel 프론트엔드 접속 가능
- [ ] Railway 백엔드 API 호출 가능
- [ ] CORS 설정 확인
- [ ] 환경변수 값 확인

**이제 Vercel 배포 오류가 해결되었습니다!** 🎯
