import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logging'
import { metrics } from '@/lib/metrics'
import { verifyJWT } from '@/lib/auth-jwt'

const createEventSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().min(1, '설명을 입력해주세요'),
  type: z.enum(['WEBINAR', 'WORKSHOP', 'SEMINAR', 'CONFERENCE', 'NETWORKING', 'ONLINE_COURSE']),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  location: z.string().optional(),
  onlineUrl: z.string().url().optional(),
  maxParticipants: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
})

// 이벤트 목록 조회
export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  try {
    logger.info('Events fetch started', { requestId })
    
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const upcoming = searchParams.get('upcoming') === 'true'

    const skip = (page - 1) * limit

    const where: any = {}

    if (type && type !== 'all') {
      where.type = type
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (upcoming) {
      where.startDate = {
        gte: new Date(),
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              nickname: true,
              image: true,
            },
          },
          _count: {
            select: {
              registrations: true,
            },
          },
        },
        orderBy: { startDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ])

    const duration = Date.now() - startTime
    
    logger.info('Events fetch completed', {
      requestId,
      eventsCount: events.length,
      total,
      duration
    })
    
    metrics.recordApiCall('events', 'GET', 'success', duration)

    return NextResponse.json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Events fetch failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    })
    
    metrics.recordApiCall('events', 'GET', 'error', duration)
    
    return NextResponse.json(
      { success: false, error: '이벤트를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 이벤트 생성
export async function POST(req: NextRequest) {
  try {
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

    // 이벤트 생성 권한 확인 (관리자 또는 특별 권한 사용자)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: '이벤트 생성 권한이 없습니다' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = createEventSchema.parse(body)

    // 시작일이 종료일보다 빠른지 확인
    if (validatedData.startDate >= validatedData.endDate) {
      return NextResponse.json(
        { error: '종료 시간은 시작 시간보다 늦어야 합니다' },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        location: validatedData.location,
        onlineUrl: validatedData.onlineUrl,
        maxParticipants: validatedData.maxParticipants,
        imageUrl: validatedData.imageUrl,
        price: validatedData.price || 0,
        tags: validatedData.tags ? validatedData.tags.join(',') : '',
        organizerId: payload.userId,
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            nickname: true,
            image: true,
          },
        },
      },
    })

    // 활동 로그 생성
    await prisma.activity.create({
      data: {
        userId: payload.userId,
        type: 'POST_CREATED',
        title: '이벤트 생성',
        description: `"${validatedData.title}" 이벤트를 생성했습니다`,
        points: 0,
      },
    })

    return NextResponse.json({ event })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: '이벤트 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}