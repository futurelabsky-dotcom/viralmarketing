import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logging'
import { metrics } from '@/lib/metrics'
import { verifyJWT } from '@/lib/auth-jwt'

// 로고 변경 히스토리 조회 (관리자만)
export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  try {
    logger.info('Logo history fetch started', { requestId })
    
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

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [logos, total] = await Promise.all([
      prisma.logo.findMany({
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              nickname: true,
            },
          },
        },
        orderBy: { version: 'desc' },
        skip,
        take: limit,
      }),
      prisma.logo.count(),
    ])

    const duration = Date.now() - startTime
    
    logger.info('Logo history fetch completed', {
      requestId,
      logosCount: logos.length,
      total,
      duration
    })
    
    metrics.recordApiCall('logo/history', 'GET', 'success', duration)

    return NextResponse.json({
      success: true,
      logos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Logo history fetch failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    })
    
    metrics.recordApiCall('logo/history', 'GET', 'error', duration)
    
    return NextResponse.json(
      { success: false, error: '로고 히스토리를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}