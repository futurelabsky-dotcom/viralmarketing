import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logging'
import { metrics } from '@/lib/metrics'
import { verifyJWT } from '@/lib/auth-jwt'

const updateNewsSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').optional(),
  content: z.string().min(1, '내용을 입력해주세요').optional(),
  excerpt: z.string().optional(),
  imageUrl: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
  sourceName: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
})

interface RouteParams {
  params: { id: string }
}

// 뉴스 상세 조회
export async function GET(req: NextRequest, { params }: RouteParams) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  const { id } = params
  
  try {
    logger.info('News detail fetch started', { requestId, newsId: id })
    
    const article = await prisma.newsArticle.findUnique({
      where: { id },
    })

    if (!article) {
      logger.warn('News not found', { requestId, newsId: id })
      
      return NextResponse.json(
        { success: false, error: '뉴스를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (!article.isPublished) {
      const token = req.cookies.get('token')?.value
      let isAdmin = false
      
      if (token) {
        const payload = verifyJWT(token)
        if (payload) {
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { isAdmin: true, isActive: true },
          })
          isAdmin = user?.isActive && user?.isAdmin || false
        }
      }

      if (!isAdmin) {
        logger.warn('News not published', { requestId, newsId: id })
        
        return NextResponse.json(
          { success: false, error: '게시되지 않은 뉴스입니다' },
          { status: 403 }
        )
      }
    }

    const duration = Date.now() - startTime
    
    logger.info('News detail fetch completed', {
      requestId,
      newsId: id,
      title: article.title,
      duration
    })
    
    metrics.recordApiCall('news_detail', 'GET', 'success', duration)

    return NextResponse.json({
      success: true,
      data: { article }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('News detail fetch failed', {
      requestId,
      newsId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    })
    
    metrics.recordApiCall('news_detail', 'GET', 'error', duration)
    
    return NextResponse.json(
      { success: false, error: '뉴스를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 뉴스 수정 (관리자만)
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const token = req.cookies.get('token')?.value
    const { id } = params

    if (!token) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다' },
        { status: 401 }
      )
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = updateNewsSchema.parse(body)

    const article = await prisma.newsArticle.update({
      where: { id },
      data: {
        ...validatedData,
        tags: validatedData.tags ? validatedData.tags.join(',') : undefined,
        updatedAt: new Date(),
        ...(validatedData.isPublished === true && {
          publishedAt: new Date(),
        }),
      },
    })

    return NextResponse.json({ article })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error updating news article:', error)
    return NextResponse.json(
      { error: '뉴스 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 뉴스 삭제 (관리자만)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const token = req.cookies.get('token')?.value
    const { id } = params

    if (!token) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다' },
        { status: 401 }
      )
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    await prisma.newsArticle.delete({
      where: { id },
    })

    return NextResponse.json({ message: '뉴스가 삭제되었습니다' })
  } catch (error) {
    console.error('Error deleting news article:', error)
    return NextResponse.json(
      { error: '뉴스 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}