import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logging'
import { metrics } from '@/lib/metrics'
import { verifyJWT } from '@/lib/auth-jwt'

interface RouteParams {
  params: { id: string }
}

const updateBannerSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').optional(),
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

// 배너 단일 조회
export async function GET(req: NextRequest, { params }: RouteParams) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  try {
    logger.info('Banner fetch started', { requestId, bannerId: params.id })
    
    const banner = await prisma.banner.findUnique({
      where: { id: params.id },
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

    if (!banner) {
      return NextResponse.json(
        { success: false, error: '배너를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const duration = Date.now() - startTime
    
    logger.info('Banner fetch completed', {
      requestId,
      bannerId: params.id,
      duration
    })
    
    metrics.recordApiCall('banners', 'GET', 'success', duration)

    return NextResponse.json({
      success: true,
      banner
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Banner fetch failed', {
      requestId,
      bannerId: params.id,
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

// 배너 수정 (관리자만)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  try {
    logger.info('Banner update started', { requestId, bannerId: params.id })
    
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
    const validatedData = updateBannerSchema.parse(body)

    // 배너 존재 확인
    const existingBanner = await prisma.banner.findUnique({
      where: { id: params.id }
    })

    if (!existingBanner) {
      return NextResponse.json(
        { success: false, error: '배너를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    
    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.subtitle !== undefined) updateData.subtitle = validatedData.subtitle
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.imageUrl !== undefined) updateData.imageUrl = validatedData.imageUrl
    if (validatedData.linkUrl !== undefined) updateData.linkUrl = validatedData.linkUrl
    if (validatedData.buttonText !== undefined) updateData.buttonText = validatedData.buttonText
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive
    if (validatedData.order !== undefined) updateData.order = validatedData.order
    if (validatedData.startDate !== undefined) updateData.startDate = validatedData.startDate ? new Date(validatedData.startDate) : null
    if (validatedData.endDate !== undefined) updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null

    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: updateData,
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
        type: 'BANNER_UPDATED',
        title: '배너 수정',
        description: `"${banner.title}" 배너를 수정했습니다`,
        points: 0,
      },
    })

    const duration = Date.now() - startTime
    
    logger.info('Banner updated successfully', {
      requestId,
      bannerId: params.id,
      title: banner.title,
      updatedBy: payload.userId,
      duration
    })
    
    metrics.recordApiCall('banners', 'PUT', 'success', duration)

    return NextResponse.json({ 
      success: true, 
      data: { banner } 
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof z.ZodError) {
      logger.warn('Banner update validation failed', {
        requestId,
        bannerId: params.id,
        errors: error.errors,
        duration
      })
      
      metrics.recordApiCall('banners', 'PUT', 'validation_error', duration)
      
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    logger.error('Banner update failed', {
      requestId,
      bannerId: params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    })
    
    metrics.recordApiCall('banners', 'PUT', 'error', duration)
    
    return NextResponse.json(
      { success: false, error: '배너 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 배너 삭제 (관리자만)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  try {
    logger.info('Banner deletion started', { requestId, bannerId: params.id })
    
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

    // 배너 존재 확인
    const existingBanner = await prisma.banner.findUnique({
      where: { id: params.id }
    })

    if (!existingBanner) {
      return NextResponse.json(
        { success: false, error: '배너를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    await prisma.banner.delete({
      where: { id: params.id }
    })

    // 활동 로그 생성
    await prisma.activity.create({
      data: {
        userId: payload.userId,
        type: 'BANNER_DELETED',
        title: '배너 삭제',
        description: `"${existingBanner.title}" 배너를 삭제했습니다`,
        points: 0,
      },
    })

    const duration = Date.now() - startTime
    
    logger.info('Banner deleted successfully', {
      requestId,
      bannerId: params.id,
      title: existingBanner.title,
      deletedBy: payload.userId,
      duration
    })
    
    metrics.recordApiCall('banners', 'DELETE', 'success', duration)

    return NextResponse.json({ 
      success: true, 
      message: '배너가 삭제되었습니다' 
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Banner deletion failed', {
      requestId,
      bannerId: params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    })
    
    metrics.recordApiCall('banners', 'DELETE', 'error', duration)
    
    return NextResponse.json(
      { success: false, error: '배너 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}