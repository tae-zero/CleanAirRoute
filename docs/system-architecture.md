# 시스템 아키텍처

## 1. 전체 시스템 아키텍처 다이어그램

```mermaid
graph TB
    subgraph "Frontend Layer"
        FE[Next.js Frontend<br/>Vercel]
        PWA[PWA Support<br/>Offline Cache]
    end
    
    subgraph "API Gateway Layer"
        LB[Load Balancer<br/>Nginx]
        AG[API Gateway<br/>Route Logic Service]
    end
    
    subgraph "Microservices Layer"
        DI[Data Ingestion Service<br/>Port: 8001]
        AI[AI Prediction Service<br/>Port: 8002]
        RL[Route Logic Service<br/>Port: 8003]
    end
    
    subgraph "Data Layer"
        PG[(PostgreSQL<br/>Primary Database)]
        RD[(Redis<br/>Cache & Session)]
        FS[(File Storage<br/>Model Files)]
    end
    
    subgraph "External APIs"
        AK[AirKorea API<br/>대기질 데이터]
        KMA[KMA API<br/>기상 데이터]
        KM[Kakao Maps API<br/>지도 서비스]
    end
    
    subgraph "Monitoring & Logging"
        PM[Prometheus<br/>메트릭 수집]
        GM[Grafana<br/>대시보드]
        ELK[ELK Stack<br/>로그 분석]
    end
    
    subgraph "CI/CD Pipeline"
        GH[GitHub Actions<br/>CI/CD]
        DC[Docker Registry<br/>이미지 저장]
        VF[Vercel<br/>Frontend 배포]
        RF[Railway<br/>Backend 배포]
    end
    
    %% Frontend to API Gateway
    FE --> LB
    PWA --> FE
    
    %% Load Balancer to Services
    LB --> AG
    LB --> DI
    LB --> AI
    LB --> RL
    
    %% API Gateway to Services
    AG --> DI
    AG --> AI
    AG --> RL
    
    %% Services to Data Layer
    DI --> PG
    DI --> RD
    AI --> PG
    AI --> RD
    AI --> FS
    RL --> PG
    RL --> RD
    
    %% Services to External APIs
    DI --> AK
    DI --> KMA
    RL --> KM
    
    %% Monitoring Connections
    DI --> PM
    AI --> PM
    RL --> PM
    PM --> GM
    DI --> ELK
    AI --> ELK
    RL --> ELK
    
    %% CI/CD Connections
    GH --> DC
    GH --> VF
    GH --> RF
    DC --> DI
    DC --> AI
    DC --> RL
    
    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef data fill:#e8f5e8
    classDef external fill:#fff3e0
    classDef monitoring fill:#fce4ec
    classDef cicd fill:#f1f8e9
    
    class FE,PWA frontend
    class LB,AG,DI,AI,RL backend
    class PG,RD,FS data
    class AK,KMA,KM external
    class PM,GM,ELK monitoring
    class GH,DC,VF,RF cicd
```

## 2. 마이크로서비스 상세 아키텍처

```mermaid
graph LR
    subgraph "Data Ingestion Service"
        DI1[API Client<br/>AirKorea/KMA]
        DI2[Data Processor<br/>Validation & Cleaning]
        DI3[Database Writer<br/>PostgreSQL]
        DI4[Cache Manager<br/>Redis]
        DI5[Scheduler<br/>Celery Tasks]
    end
    
    subgraph "AI Prediction Service"
        AI1[Model Loader<br/>PyTorch Models]
        AI2[Feature Engineer<br/>Data Preprocessing]
        AI3[Predictor<br/>LSTM/GRU Models]
        AI4[Result Cache<br/>Redis]
        AI5[Model Monitor<br/>Performance Tracking]
    end
    
    subgraph "Route Logic Service"
        RL1[Route Calculator<br/>Dijkstra/A*]
        RL2[Map Integration<br/>Kakao Maps]
        RL3[Air Quality Mapper<br/>Pollution Overlay]
        RL4[Optimization Engine<br/>Multi-objective]
        RL5[User Preferences<br/>Personalization]
    end
    
    DI1 --> DI2
    DI2 --> DI3
    DI2 --> DI4
    DI5 --> DI1
    
    AI1 --> AI2
    AI2 --> AI3
    AI3 --> AI4
    AI5 --> AI1
    
    RL1 --> RL2
    RL2 --> RL3
    RL3 --> RL4
    RL4 --> RL5
```

## 3. 데이터 플로우 다이어그램

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant R as Route Logic
    participant D as Data Ingestion
    participant A as AI Prediction
    participant DB as Database
    participant C as Cache
    
    U->>F: 경로 요청
    F->>R: POST /api/v1/routes/calculate
    
    R->>D: 대기질 데이터 요청
    D->>DB: 최신 데이터 조회
    DB-->>D: 대기질 데이터
    D-->>R: 현재 대기질 정보
    
    R->>A: 예측 데이터 요청
    A->>C: 캐시 확인
    alt 캐시 미스
        A->>DB: 과거 데이터 조회
        A->>A: AI 모델 예측
        A->>C: 예측 결과 캐시
    end
    C-->>A: 예측 데이터
    A-->>R: 72시간 예측
    
    R->>R: 경로 계산 및 최적화
    R-->>F: 최적 경로 결과
    F-->>U: 경로 시각화
```

## 4. 배포 아키텍처

```mermaid
graph TB
    subgraph "Development Environment"
        DEV[Local Development<br/>Docker Compose]
    end
    
    subgraph "Staging Environment"
        STG[Railway Staging<br/>Preview Deployments]
    end
    
    subgraph "Production Environment"
        subgraph "Frontend"
            VF[Vercel<br/>Global CDN]
        end
        
        subgraph "Backend"
            RF[Railway Production<br/>Auto-scaling]
        end
        
        subgraph "Database"
            RDS[Railway PostgreSQL<br/>Managed Database]
            REDIS[Railway Redis<br/>Managed Cache]
        end
    end
    
    subgraph "CI/CD Pipeline"
        GH[GitHub Repository]
        GA[GitHub Actions]
        DR[Docker Registry]
    end
    
    DEV --> STG
    STG --> RF
    GH --> GA
    GA --> DR
    GA --> VF
    GA --> RF
    DR --> RF
    
    RF --> RDS
    RF --> REDIS
    VF --> RF
```

## 5. 보안 아키텍처

```mermaid
graph TB
    subgraph "Security Layers"
        WAF[Web Application Firewall<br/>DDoS Protection]
        LB[Load Balancer<br/>SSL Termination]
        AG[API Gateway<br/>Rate Limiting]
        AUTH[Authentication<br/>JWT Tokens]
        RBAC[Role-Based Access Control]
    end
    
    subgraph "Network Security"
        VPC[Virtual Private Cloud]
        SG[Security Groups]
        NACL[Network ACLs]
    end
    
    subgraph "Data Security"
        ENC[Data Encryption<br/>At Rest & In Transit]
        BACKUP[Automated Backups]
        AUDIT[Audit Logging]
    end
    
    WAF --> LB
    LB --> AG
    AG --> AUTH
    AUTH --> RBAC
    
    VPC --> SG
    SG --> NACL
    
    ENC --> BACKUP
    BACKUP --> AUDIT
```

## 6. 모니터링 아키텍처

```mermaid
graph TB
    subgraph "Application Metrics"
        APP[Application<br/>Custom Metrics]
        HTTP[HTTP Metrics<br/>Request/Response]
        DB[Database Metrics<br/>Query Performance]
    end
    
    subgraph "Infrastructure Metrics"
        CPU[CPU Usage]
        MEM[Memory Usage]
        NET[Network I/O]
        DISK[Disk I/O]
    end
    
    subgraph "Monitoring Stack"
        PROM[Prometheus<br/>Metrics Collection]
        GRAF[Grafana<br/>Visualization]
        ALERT[AlertManager<br/>Notification]
    end
    
    subgraph "Logging Stack"
        LOG[Application Logs]
        FILE[File Logs]
        ELK[ELK Stack<br/>Log Analysis]
    end
    
    APP --> PROM
    HTTP --> PROM
    DB --> PROM
    CPU --> PROM
    MEM --> PROM
    NET --> PROM
    DISK --> PROM
    
    PROM --> GRAF
    PROM --> ALERT
    
    LOG --> ELK
    FILE --> ELK
```

## 7. 확장성 고려사항

### 7.1 수평 확장 (Horizontal Scaling)
- **로드 밸런서**: Nginx를 통한 트래픽 분산
- **마이크로서비스**: 각 서비스 독립적 확장
- **데이터베이스**: 읽기 전용 복제본 활용
- **캐시**: Redis 클러스터 구성

### 7.2 수직 확장 (Vertical Scaling)
- **컨테이너 리소스**: CPU/메모리 동적 조정
- **데이터베이스**: 인스턴스 크기 확장
- **AI 모델**: GPU 인스턴스 활용

### 7.3 자동 확장 (Auto Scaling)
- **Railway**: 트래픽 기반 자동 확장
- **Vercel**: 글로벌 CDN 자동 최적화
- **모니터링**: 메트릭 기반 알림 및 조치

이 시스템 아키텍처는 확장 가능하고 안정적인 클라우드 네이티브 애플리케이션을 위한 종합적인 설계를 제시합니다.
