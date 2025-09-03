import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logging'
import { metrics } from '@/lib/metrics'
import { verifyJWT } from '@/lib/auth-jwt'

const createLogoSchema = z.object({
  siteName: z.string().min(1, '사이트명을 입력해주세요'),
  logoImageUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '올바른 HEX 색상 코드를 입력해주세요').optional(),
  description: z.string().optional(),
})

const updateLogoSchema = z.object({
  siteName: z.string().min(1, '사이트명을 입력해주세요').optional(),
  logoImageUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '올바른 HEX 색상 코드를 입력해주세요').optional(),
  description: z.string().optional(),
})

// 활성 로고 조회 (공개)
export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  try {
    logger.info('Logo fetch started', { requestId })

    // 활성 로고 조회
    const logo = await prisma.logo.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
      },
    })

    const duration = Date.now() - startTime
    
    logger.info('Logo fetch completed', {
      requestId,
      logoId: logo?.id || 'none',
      duration
    })
    
    metrics.recordApiCall('logo', 'GET', 'success', duration)

    // 기본값 반환
    const defaultLogo = {
      siteName: '마케팅 커뮤니티',
      logoImageUrl: null,
      faviconUrl: null,
      brandColor: '#0066cc',
      description: '마케터와 사업자를 위한 종합 플랫폼',
    }

    return NextResponse.json({
      success: true,
      logo: logo || defaultLogo
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Logo fetch failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    })
    
    metrics.recordApiCall('logo', 'GET', 'error', duration)
    
    return NextResponse.json(
      { success: false, error: '로고를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 로고 생성 또는 업데이트 (관리자만)
export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  try {
    logger.info('Logo creation/update started', { requestId })
    
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다' },
        { status: 401 }
      )
    }

    // 사용자 상태 및 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { isActive: true, isAdmin: true }
    })

    if (!user?.isActive) {
      return NextResponse.json(
        { success: false, error: '비활성화된 계정입니다' },
        { status: 403 }
      )
    }

    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = createLogoSchema.parse(body)

    // 기존 활성 로고 비활성화
    await prisma.logo.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })

    // 새 버전 번호 계산
    const lastLogo = await prisma.logo.findFirst({
      orderBy: { version: 'desc' }
    })
    const newVersion = (lastLogo?.version || 0) + 1

    const logo = await prisma.logo.create({
      data: {
        siteName: validatedData.siteName,
        logoImageUrl: validatedData.logoImageUrl,
        faviconUrl: validatedData.faviconUrl,
        brandColor: validatedData.brandColor,
        description: validatedData.description,
        version: newVersion,
        isActive: true,
        createdBy: payload.userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            nickname: true,
          },
        },
      },
    })

    // 활동 로그 생성
    await prisma.activity.create({
      data: {
        userId: payload.userId,
        type: 'LOGO_UPDATED',
        title: '로고 설정 변경',
        description: `사이트 로고를 업데이트했습니다 (v${newVersion})`,
        points: 0,
      },
    })

    const duration = Date.now() - startTime
    
    logger.info('Logo created/updated successfully', {
      requestId,
      logoId: logo.id,
      version: logo.version,
      siteName: logo.siteName,
      updatedBy: payload.userId,
      duration
    })
    
    metrics.recordApiCall('logo', 'POST', 'success', duration)

    return NextResponse.json({ 
      success: true, 
      data: { logo } 
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof z.ZodError) {
      logger.warn('Logo creation/update validation failed', {
        requestId,
        errors: error.errors,
        duration
      })
      
      metrics.recordApiCall('logo', 'POST', 'validation_error', duration)
      
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    logger.error('Logo creation/update failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    })
    
    metrics.recordApiCall('logo', 'POST', 'error', duration)
    
    return NextResponse.json(
      { success: false, error: '로고 설정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}