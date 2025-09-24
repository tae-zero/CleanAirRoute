# API 명세서

## 1. API 개요

### 1.1 기본 정보
- **Base URL**: `https://api.cleanair-route.com/api/v1`
- **API Version**: v1
- **Content Type**: `application/json`
- **Authentication**: Bearer Token (JWT)

### 1.2 공통 응답 형식
```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "error": null,
  "timestamp": "2024-12-19T10:30:00Z",
  "version": "v1"
}
```

### 1.3 에러 응답 형식
```json
{
  "success": false,
  "data": null,
  "message": "Error message",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": "Invalid request parameters"
  },
  "timestamp": "2024-12-19T10:30:00Z",
  "version": "v1"
}
```

## 2. 인증 API

### 2.1 사용자 등록
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "nickname": "사용자닉네임",
  "preferred_language": "ko"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid-string",
    "email": "user@example.com",
    "nickname": "사용자닉네임",
    "created_at": "2024-12-19T10:30:00Z"
  },
  "message": "User registered successfully"
}
```

### 2.2 사용자 로그인
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "jwt-token-string",
    "token_type": "bearer",
    "expires_in": 1800,
    "user": {
      "user_id": "uuid-string",
      "email": "user@example.com",
      "nickname": "사용자닉네임"
    }
  },
  "message": "Login successful"
}
```

### 2.3 토큰 갱신
```http
POST /auth/refresh
```

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "new-jwt-token-string",
    "token_type": "bearer",
    "expires_in": 1800
  },
  "message": "Token refreshed successfully"
}
```

## 3. 대기질 데이터 API

### 3.1 현재 대기질 조회
```http
GET /air-quality/current
```

**Query Parameters:**
- `latitude` (float, required): 위도
- `longitude` (float, required): 경도
- `radius` (int, optional): 반경 (km, 기본값: 5)

**Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": 37.5665,
      "longitude": 126.9780,
      "district": "중구"
    },
    "air_quality": {
      "pm25": 25.5,
      "pm10": 45.2,
      "o3": 0.045,
      "no2": 0.025,
      "co": 0.8,
      "so2": 0.005
    },
    "air_quality_index": 75,
    "grade": "moderate",
    "measured_at": "2024-12-19T10:00:00Z",
    "station_info": {
      "station_id": "111121",
      "station_name": "중구 측정소",
      "distance": 1.2
    }
  },
  "message": "Current air quality data retrieved"
}
```

### 3.2 대기질 예측 조회
```http
GET /air-quality/forecast
```

**Query Parameters:**
- `latitude` (float, required): 위도
- `longitude` (float, required): 경도
- `horizon` (int, optional): 예측 시간 (시간, 기본값: 72)

**Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": 37.5665,
      "longitude": 126.9780,
      "district": "중구"
    },
    "forecasts": [
      {
        "timestamp": "2024-12-19T11:00:00Z",
        "pm25": 28.3,
        "pm10": 48.1,
        "o3": 0.052,
        "no2": 0.028,
        "air_quality_index": 82,
        "grade": "moderate",
        "confidence": 0.85
      },
      {
        "timestamp": "2024-12-19T12:00:00Z",
        "pm25": 31.2,
        "pm10": 52.4,
        "o3": 0.048,
        "no2": 0.031,
        "air_quality_index": 88,
        "grade": "moderate",
        "confidence": 0.82
      }
    ],
    "model_info": {
      "model_version": "v1.2.0",
      "last_updated": "2024-12-19T09:00:00Z"
    }
  },
  "message": "Air quality forecast retrieved"
}
```

### 3.3 대기질 히트맵 데이터
```http
GET /air-quality/heatmap
```

**Query Parameters:**
- `bounds` (string, required): 지도 경계 (sw_lat,sw_lng,ne_lat,ne_lng)
- `timestamp` (string, optional): 특정 시간 (ISO 8601)
- `pollutant` (string, optional): 오염물질 (pm25, pm10, o3, no2)

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-12-19T10:00:00Z",
    "pollutant": "pm25",
    "heatmap_data": [
      {
        "latitude": 37.5665,
        "longitude": 126.9780,
        "intensity": 25.5,
        "grade": "moderate"
      },
      {
        "latitude": 37.5675,
        "longitude": 126.9790,
        "intensity": 28.3,
        "grade": "moderate"
      }
    ],
    "color_scale": {
      "good": "#00E400",
      "moderate": "#FFFF00",
      "unhealthy": "#FF7E00",
      "very_unhealthy": "#FF0000",
      "hazardous": "#8F3F97"
    }
  },
  "message": "Heatmap data retrieved"
}
```

## 4. 경로 추천 API

### 4.1 경로 계산
```http
POST /routes/calculate
```

**Request Body:**
```json
{
  "start": {
    "latitude": 37.5665,
    "longitude": 126.9780,
    "address": "서울시 중구 세종대로 110"
  },
  "end": {
    "latitude": 37.5512,
    "longitude": 126.9882,
    "address": "서울시 용산구 이태원로 200"
  },
  "options": {
    "route_types": ["fastest", "shortest", "healthiest"],
    "departure_time": "2024-12-19T14:00:00Z",
    "preferences": {
      "max_walking_distance": 500,
      "avoid_highways": false,
      "health_weight": 0.7
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "routes": [
      {
        "route_id": "route_001",
        "type": "fastest",
        "summary": {
          "duration": 25,
          "distance": 8.5,
          "air_quality_score": 72,
          "pollution_exposure": {
            "pm25": 28.5,
            "pm10": 45.2,
            "o3": 0.045
          }
        },
        "waypoints": [
          {
            "latitude": 37.5665,
            "longitude": 126.9780,
            "air_quality": {
              "pm25": 25.5,
              "grade": "moderate"
            }
          },
          {
            "latitude": 37.5512,
            "longitude": 126.9882,
            "air_quality": {
              "pm25": 31.2,
              "grade": "moderate"
            }
          }
        ],
        "polyline": "encoded_polyline_string"
      },
      {
        "route_id": "route_002",
        "type": "healthiest",
        "summary": {
          "duration": 35,
          "distance": 9.2,
          "air_quality_score": 88,
          "pollution_exposure": {
            "pm25": 22.1,
            "pm10": 38.5,
            "o3": 0.038
          }
        },
        "waypoints": [
          {
            "latitude": 37.5665,
            "longitude": 126.9780,
            "air_quality": {
              "pm25": 25.5,
              "grade": "moderate"
            }
          },
          {
            "latitude": 37.5512,
            "longitude": 126.9882,
            "air_quality": {
              "pm25": 18.8,
              "grade": "good"
            }
          }
        ],
        "polyline": "encoded_polyline_string"
      }
    ],
    "calculation_time": "2024-12-19T10:30:00Z"
  },
  "message": "Routes calculated successfully"
}
```

### 4.2 경로 상세 정보
```http
GET /routes/{route_id}
```

**Path Parameters:**
- `route_id` (string, required): 경로 ID

**Response:**
```json
{
  "success": true,
  "data": {
    "route_id": "route_001",
    "type": "fastest",
    "summary": {
      "duration": 25,
      "distance": 8.5,
      "air_quality_score": 72,
      "pollution_exposure": {
        "pm25": 28.5,
        "pm10": 45.2,
        "o3": 0.045
      }
    },
    "segments": [
      {
        "segment_id": "seg_001",
        "start": {
          "latitude": 37.5665,
          "longitude": 126.9780
        },
        "end": {
          "latitude": 37.5645,
          "longitude": 126.9800
        },
        "duration": 5,
        "distance": 1.2,
        "air_quality": {
          "pm25": 25.5,
          "pm10": 42.1,
          "o3": 0.045,
          "grade": "moderate"
        },
        "instructions": "세종대로를 따라 직진하세요"
      }
    ],
    "air_quality_chart": {
      "timestamps": ["2024-12-19T14:00:00Z", "2024-12-19T14:05:00Z"],
      "pm25_values": [25.5, 28.3],
      "pm10_values": [42.1, 45.2],
      "o3_values": [0.045, 0.048]
    }
  },
  "message": "Route details retrieved"
}
```

### 4.3 경로 최적화
```http
POST /routes/optimize
```

**Request Body:**
```json
{
  "route_id": "route_001",
  "optimization_criteria": {
    "minimize_pollution": true,
    "max_duration_increase": 10,
    "prefer_parks": true,
    "avoid_construction": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "optimized_route": {
      "route_id": "route_001_optimized",
      "type": "optimized",
      "summary": {
        "duration": 28,
        "distance": 8.8,
        "air_quality_score": 85,
        "improvement": {
          "air_quality_score": 13,
          "duration_increase": 3
        }
      },
      "optimization_details": {
        "parks_used": 2,
        "construction_avoided": 1,
        "pollution_reduction": 15.2
      }
    }
  },
  "message": "Route optimized successfully"
}
```

## 5. 사용자 관리 API

### 5.1 저장된 위치 관리
```http
GET /users/locations
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "locations": [
      {
        "location_id": "loc_001",
        "name": "집",
        "latitude": 37.5665,
        "longitude": 126.9780,
        "address": "서울시 중구 세종대로 110",
        "location_type": "home",
        "is_default": true,
        "created_at": "2024-12-19T10:30:00Z"
      },
      {
        "location_id": "loc_002",
        "name": "회사",
        "latitude": 37.5512,
        "longitude": 126.9882,
        "address": "서울시 용산구 이태원로 200",
        "location_type": "work",
        "is_default": false,
        "created_at": "2024-12-19T10:30:00Z"
      }
    ]
  },
  "message": "Saved locations retrieved"
}
```

### 5.2 위치 추가
```http
POST /users/locations
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "카페",
  "latitude": 37.5645,
  "longitude": 126.9800,
  "address": "서울시 중구 명동길 123",
  "location_type": "favorite"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "location_id": "loc_003",
    "name": "카페",
    "latitude": 37.5645,
    "longitude": 126.9800,
    "address": "서울시 중구 명동길 123",
    "location_type": "favorite",
    "is_default": false,
    "created_at": "2024-12-19T10:30:00Z"
  },
  "message": "Location saved successfully"
}
```

### 5.3 사용자 선호도 설정
```http
PUT /users/preferences
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "route_preferences": {
    "default_route_type": "healthiest",
    "max_walking_distance": 500,
    "avoid_highways": true,
    "health_weight": 0.8
  },
  "notification_preferences": {
    "air_quality_alerts": true,
    "route_recommendations": true,
    "health_tips": true
  },
  "display_preferences": {
    "language": "ko",
    "units": "metric",
    "theme": "light"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "route_preferences": {
        "default_route_type": "healthiest",
        "max_walking_distance": 500,
        "avoid_highways": true,
        "health_weight": 0.8
      },
      "notification_preferences": {
        "air_quality_alerts": true,
        "route_recommendations": true,
        "health_tips": true
      },
      "display_preferences": {
        "language": "ko",
        "units": "metric",
        "theme": "light"
      }
    },
    "updated_at": "2024-12-19T10:30:00Z"
  },
  "message": "Preferences updated successfully"
}
```

## 6. 시스템 관리 API

### 6.1 헬스체크
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-12-19T10:30:00Z",
    "services": {
      "database": "healthy",
      "redis": "healthy",
      "ai_model": "healthy",
      "external_apis": "healthy"
    },
    "version": "v1.0.0",
    "uptime": 86400
  },
  "message": "System is healthy"
}
```

### 6.2 메트릭 조회
```http
GET /metrics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "api_requests": {
      "total": 15420,
      "successful": 15230,
      "failed": 190,
      "success_rate": 0.987
    },
    "response_times": {
      "average": 245,
      "p95": 450,
      "p99": 890
    },
    "air_quality_predictions": {
      "total": 3240,
      "accuracy": 0.92,
      "average_confidence": 0.85
    },
    "route_calculations": {
      "total": 1890,
      "average_calculation_time": 1.2
    }
  },
  "message": "Metrics retrieved"
}
```

## 7. 에러 코드

### 7.1 HTTP 상태 코드
- `200 OK`: 요청 성공
- `201 Created`: 리소스 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `422 Unprocessable Entity`: 유효성 검사 실패
- `429 Too Many Requests`: 요청 한도 초과
- `500 Internal Server Error`: 서버 오류
- `503 Service Unavailable`: 서비스 이용 불가

### 7.2 비즈니스 에러 코드
- `VALIDATION_ERROR`: 입력 데이터 유효성 검사 실패
- `AUTHENTICATION_ERROR`: 인증 실패
- `AUTHORIZATION_ERROR`: 권한 없음
- `RESOURCE_NOT_FOUND`: 리소스 없음
- `EXTERNAL_API_ERROR`: 외부 API 오류
- `MODEL_PREDICTION_ERROR`: AI 모델 예측 오류
- `ROUTE_CALCULATION_ERROR`: 경로 계산 오류
- `RATE_LIMIT_EXCEEDED`: 요청 한도 초과

## 8. Rate Limiting

### 8.1 제한 정책
- **일반 사용자**: 분당 100회 요청
- **인증된 사용자**: 분당 500회 요청
- **API 키 사용자**: 분당 1000회 요청

### 8.2 Rate Limit 헤더
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

이 API 명세서는 클린에어 루트 서비스의 모든 엔드포인트와 사용법을 상세히 설명합니다.
