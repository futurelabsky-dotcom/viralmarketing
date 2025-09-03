# 🚀 마케팅 커뮤니티 배포 가이드

## 📋 목차
1. [호스팅 서비스 추천](#호스팅-서비스-추천)
2. [데이터베이스 설정](#데이터베이스-설정)
3. [환경 변수 설정](#환경-변수-설정)
4. [도메인 및 SSL 설정](#도메인-및-ssl-설정)
5. [배포 단계별 가이드](#배포-단계별-가이드)
6. [운영 및 관리](#운영-및-관리)

---

## 🏢 호스팅 서비스 추천

### 1. 🥇 **Vercel (최고 추천)**
**비용**: 무료 ~ $20/월
- ✅ **Next.js 최적화**: 개발사에서 만든 플랫폼
- ✅ **무료 플랜**: 개인/소규모 프로젝트 충분
- ✅ **자동 배포**: GitHub 연동 시 자동 배포
- ✅ **글로벌 CDN**: 전 세계 빠른 접속
- ✅ **도메인 제공**: `.vercel.app` 무료 도메인

### 2. 🥈 **Netlify**
**비용**: 무료 ~ $19/월
- ✅ **무료 플랜**: 월 100GB 대역폭
- ✅ **폼 처리**: 문의 폼 자동 처리
- ✅ **CDN 및 SSL**: 무료 제공

### 3. 🥉 **Railway**
**비용**: $5/월 ~ 
- ✅ **풀스택 호스팅**: 데이터베이스 포함
- ✅ **간단한 배포**: Git 연동 자동 배포
- ✅ **PostgreSQL**: 무료 데이터베이스 제공

### 4. **AWS / Google Cloud**
**비용**: 사용량에 따라 $10-50/월
- ✅ **확장성**: 대규모 트래픽 대응
- ❌ **복잡성**: 설정이 복잡함

---

## 🗄️ 데이터베이스 설정

### 옵션 1: **PlanetScale (추천)**
```bash
# 무료 5GB, MySQL 호환
# 글로벌 분산 데이터베이스
# 자동 백업 및 브랜칭 지원
```

### 옵션 2: **Supabase**
```bash
# PostgreSQL 기반
# 무료 500MB
# 실시간 기능 지원
```

### 옵션 3: **Neon**
```bash
# PostgreSQL 전용
# 무료 3GB
# 서버리스 아키텍처
```

---

## ⚙️ 환경 변수 설정

### 필수 환경 변수들

```env
# .env.production
# 데이터베이스
DATABASE_URL="your-database-connection-string"

# NextAuth 설정
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secret-key-here"

# JWT 설정
JWT_SECRET="your-jwt-secret-key"

# 파일 업로드 (선택사항)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# 이메일 (선택사항)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# 소셜 로그인 (선택사항)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# 분석 도구 (선택사항)
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
```

---

## 🌐 도메인 및 SSL 설정

### 1. **도메인 구매**
추천 업체:
- **가비아**: 한국 도메인 (.co.kr, .kr)
- **Namecheap**: 해외 도메인 (.com, .net)
- **Cloudflare**: 도메인 + CDN 서비스

### 2. **SSL 인증서**
- **무료**: Let's Encrypt (자동 제공)
- **유료**: Cloudflare Pro ($20/월)

---

## 📦 배포 단계별 가이드

### Phase 1: Vercel 배포 (추천)

#### 1단계: GitHub에 코드 업로드
```bash
cd C:\Users\USER\Desktop\marketing-community

# Git 초기화 (이미 되어 있으면 스킵)
git init
git add .
git commit -m "Initial commit: 마케팅 커뮤니티 완성"

# GitHub 리포지토리 생성 후 연결
git remote add origin https://github.com/your-username/marketing-community.git
git push -u origin main
```

#### 2단계: Vercel 연결
1. [Vercel.com](https://vercel.com) 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭
4. GitHub 리포지토리 선택
5. 프로젝트 설정:
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   ```

#### 3단계: 환경 변수 설정
Vercel 대시보드에서:
1. Settings → Environment Variables
2. 위의 환경 변수들 입력
3. Production, Preview, Development 모두 체크

#### 4단계: 데이터베이스 연결
```bash
# PlanetScale 예시
1. PlanetScale 계정 생성
2. 새 데이터베이스 생성
3. Connection String 복사
4. Vercel 환경 변수에 DATABASE_URL 설정
```

#### 5단계: 배포 확인
```bash
# Vercel에서 자동 배포 완료 후
# https://your-project.vercel.app 접속 확인
```

### Phase 2: 데이터베이스 마이그레이션

#### Prisma 마이그레이션
```bash
# 로컬에서 프로덕션 DB에 마이그레이션
npx prisma migrate deploy
npx prisma generate
npx prisma db seed  # 초기 데이터 생성
```

---

## 🔧 프로덕션 최적화

### 1. **next.config.js 프로덕션 설정**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 프로덕션 최적화
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // 이미지 최적화
  images: {
    domains: ['your-domain.com', 'cdn.your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}
```

### 2. **package.json 스크립트 추가**
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "deploy": "npm run build && npm run db:migrate:deploy",
    "db:migrate:deploy": "prisma migrate deploy",
    "postbuild": "next-sitemap"
  }
}
```

---

## 📊 모니터링 및 분석

### 1. **Google Analytics 4 설정**
```javascript
// lib/gtag.js
export const GA_TRACKING_ID = process.env.GOOGLE_ANALYTICS_ID

export const pageview = (url) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}
```

### 2. **에러 모니터링**
```bash
# Sentry 설치
npm install @sentry/nextjs
```

---

## 💰 예상 비용 (월별)

### 🆓 **무료 플랜**
- **Vercel**: 무료 (대부분의 개인 프로젝트 충분)
- **PlanetScale**: 5GB 무료
- **도메인**: $10-15/년
- **총 비용**: ~$1-2/월

### 💳 **프리미엄 플랜**
- **Vercel Pro**: $20/월 (팀 기능 + 무제한 대역폭)
- **PlanetScale Scale**: $29/월 (25GB + 백업)
- **Cloudflare Pro**: $20/월 (CDN + 보안)
- **총 비용**: ~$70/월

---

## 🎯 런칭 체크리스트

### 배포 전 확인사항
- [ ] 환경 변수 모두 설정
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 관리자 계정 생성
- [ ] 테스트 데이터 입력
- [ ] SEO 메타 태그 확인
- [ ] sitemap.xml 생성
- [ ] robots.txt 설정

### 런칭 후 작업
- [ ] Google Search Console 등록
- [ ] Google Analytics 연결
- [ ] 소셜미디어 계정 생성
- [ ] 초기 컨텐츠 업로드
- [ ] 커뮤니티 가이드라인 작성

---

## 🚀 추천 런칭 순서

### 1주차: 기반 구축
1. **Vercel + PlanetScale** 배포
2. **도메인 연결** 및 SSL 설정
3. **관리자 계정** 생성
4. **기본 설정** (로고, 배너, 카테고리)

### 2주차: 컨텐츠 준비
1. **공지사항** 작성
2. **FAQ** 작성
3. **샘플 게시글** 작성
4. **이벤트** 등록

### 3주차: 마케팅 준비
1. **SEO 최적화**
2. **소셜미디어** 계정 생성
3. **론칭 이벤트** 기획
4. **베타 사용자** 초대

### 4주차: 정식 런칭
1. **공식 런칭** 발표
2. **프레스 릴리즈** 배포
3. **커뮤니티** 홍보
4. **피드백** 수집 및 개선

---

## 📞 지원 및 문의

프로젝트가 성공적으로 런칭되기를 응원합니다! 🎉

**즐거운 커뮤니티 운영 되세요!** 🌟