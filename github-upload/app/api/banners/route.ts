import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logging'
import { metrics } from '@/lib/metrics'
import { verifyJWT } from '@/lib/auth-jwt'

const createBannerSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  linkUrl: z.string().url().optional(),
  buttonText: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

// 배너 목록 조회
export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  try {
    logger.info('Banners fetch started', { requestId })
    
    const { searchParams } = new URL(req.url)
    const isActiveOnly = searchParams.get('active') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const now = new Date()
    
    let where: any = {}
    
    if (isActiveOnly) {
      where = {
        isActive: true,
        OR: [
          {
            startDate: null,
            endDate: null,
          },
          {
            startDate: { lte: now },
            endDate: { gte: now },
          },
          {
            startDate: { lte: now },
            endDate: null,
          },
          {
            startDate: null,
            endDate: { gte: now },
          },
        ]
      }
    }

    const [banners, total] = await Promise.all([
      prisma.banner.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              nickname: true,
            },
          },
        },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: isActiveOnly ? undefined : skip,
        take: isActiveOnly ? undefined : limit,
      }),
      isActiveOnly ? prisma.banner.count({ where }) : prisma.banner.count({ where }),
    ])

    const duration = Date.now() - startTime
    
    logger.info('Banners fetch completed', {
      requestId,
      bannersCount: banners.length,
      total,
      duration
    })
    
    metrics.recordApiCall('banners', 'GET', 'success', duration)

    return NextResponse.json({
      success: true,
      banners,
      pagination: isActiveOnly ? undefined : {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Banners fetch failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    })
    
    metrics.recordApiCall('banners', 'GET', 'error', duration)
    
    return NextResponse.json(
      { success: false, error: '배너를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 배너 생성 (관리자만)
export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  try {
    logger.info('Banner creation started', { requestId })
    
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
    const validatedData = createBannerSchema.parse(body)

    const banner = await prisma.banner.create({
      data: {
        title: validatedData.title,
        subtitle: validatedData.subtitle,
        description: validatedData.description,
        imageUrl: validatedData.imageUrl,
        linkUrl: validatedData.linkUrl,
        buttonText: validatedData.buttonText,
        isActive: validatedData.isActive !== false, // 기본값 true
        order: validatedData.order || 0,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
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
        type: 'BANNER_CREATED',
        title: '배너 생성',
        description: `"${validatedData.title}" 배너를 생성했습니다`,
        points: 0,
      },
    })

    const duration = Date.now() - startTime
    
    logger.info('Banner created successfully', {
      requestId,
      bannerId: banner.id,
      title: banner.title,
      createdBy: payload.userId,
      duration
    })
    
    metrics.recordApiCall('banners', 'POST', 'success', duration)

    return NextResponse.json({ 
      success: true, 
      data: { banner } 
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof z.ZodError) {
      logger.warn('Banner creation validation failed', {
        requestId,
        errors: error.errors,
        duration
      })
      
      metrics.recordApiCall('banners', 'POST', 'validation_error', duration)
      
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    logger.error('Banner creation failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    })
    
    metrics.recordApiCall('banners', 'POST', 'error', duration)
    
    return NextResponse.json(
      { success: false, error: '배너 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}