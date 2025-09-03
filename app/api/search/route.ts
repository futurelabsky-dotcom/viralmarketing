import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logging'
import { metrics } from '@/lib/metrics'

const searchSchema = z.object({
  q: z.string().min(1, '검색어를 입력해주세요').max(100, '검색어는 100자 이하로 입력해주세요'),
  type: z.enum(['all', 'posts', 'users', 'news', 'events']).optional().default('all'),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1).pipe(z.number().min(1).default(1)),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10).pipe(z.number().min(1).max(50).default(10)),
  sort: z.enum(['relevance', 'latest', 'popular']).optional().default('relevance'),
})

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(req.url)
    
    logger.info('Search started', { 
      requestId, 
      query: searchParams.get('q'),
      type: searchParams.get('type')
    })

    // 검색 파라미터 검증
    const params = searchSchema.parse({
      q: searchParams.get('q'),
      type: searchParams.get('type'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sort: searchParams.get('sort'),
    })

    const skip = (params.page - 1) * params.limit
    const searchTerm = params.q.trim()

    let results: any[] = []
    let totalCount = 0

    // 검색 타입에 따른 쿼리 실행
    if (params.type === 'all' || params.type === 'posts') {
      const whereClause = {
        status: 'PUBLISHED' as const,
        OR: [
          { title: { contains: searchTerm } },
          { content: { contains: searchTerm } },
          { excerpt: { contains: searchTerm } },
          { tags: { contains: searchTerm } },
        ],
      }

      const orderByClause = params.sort === 'latest' 
        ? { createdAt: 'desc' as const }
        : params.sort === 'popular'
        ? { viewCount: 'desc' as const }
        : { createdAt: 'desc' as const } // relevance 기본은 최신순

      const [posts, postCount] = await Promise.all([
        prisma.post.findMany({
          where: whereClause,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                nickname: true,
                image: true,
              },
            },
            category: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
          orderBy: orderByClause,
          skip: params.type === 'posts' ? skip : 0,
          take: params.type === 'posts' ? params.limit : Math.min(5, params.limit),
        }),
        prisma.post.count({
          where: whereClause,
        }),
      ])

      const transformedPosts = posts.map(post => ({
        id: post.id,
        type: 'post',
        title: post.title,
        content: post.excerpt || post.content.substring(0, 200) + '...',
        author: {
          name: post.author.name,
          nickname: post.author.nickname,
          image: post.author.image,
        },
        category: post.category.name,
        createdAt: post.createdAt.toISOString(),
        tags: post.tags ? post.tags.split(',').filter(Boolean) : [],
        stats: {
          views: post.viewCount || 0,
          likes: post._count.likes,
          comments: post._count.comments,
        },
      }))

      if (params.type === 'posts') {
        results = transformedPosts
        totalCount = postCount
      } else {
        results.push(...transformedPosts)
        totalCount += postCount
      }
    }

    if (params.type === 'all' || params.type === 'users') {
      const whereClause = {
        isActive: true,
        OR: [
          { name: { contains: searchTerm } },
          { nickname: { contains: searchTerm } },
          { company: { contains: searchTerm } },
          { interests: { contains: searchTerm } },
        ],
      }

      const [users, userCount] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            nickname: true,
            image: true,
            company: true,
            position: true,
            interests: true,
            createdAt: true,
            _count: {
              select: {
                posts: true,
                comments: true,
              },
            },
          },
          skip: params.type === 'users' ? skip : 0,
          take: params.type === 'users' ? params.limit : Math.min(3, params.limit),
        }),
        prisma.user.count({
          where: whereClause,
        }),
      ])

      const transformedUsers = users.map(user => ({
        id: user.id,
        type: 'user',
        title: `${user.name} (${user.nickname})`,
        content: `${user.company ? `${user.company} ${user.position || ''}`.trim() + ' - ' : ''}${user.interests || '관심분야 미설정'}`,
        author: {
          name: user.name,
          nickname: user.nickname,
          image: user.image,
        },
        createdAt: user.createdAt.toISOString(),
        tags: user.interests ? user.interests.split(',').filter(Boolean) : [],
        stats: {
          views: 0,
          likes: 0,
          comments: user._count.posts + user._count.comments,
        },
      }))

      if (params.type === 'users') {
        results = transformedUsers
        totalCount = userCount
      } else {
        results.push(...transformedUsers)
        totalCount += userCount
      }
    }

    // all 타입인 경우 정렬 및 페이징 적용
    if (params.type === 'all') {
      if (params.sort === 'latest') {
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      } else if (params.sort === 'popular') {
        results.sort((a, b) => (b.stats.views + b.stats.likes) - (a.stats.views + a.stats.likes))
      }
      
      const paginatedResults = results.slice(skip, skip + params.limit)
      results = paginatedResults
    }

    const totalPages = Math.ceil(totalCount / params.limit)

    // 검색 키워드 추적 및 통계 업데이트
    try {
      await prisma.searchKeyword.upsert({
        where: { keyword: searchTerm },
        update: {
          count: { increment: 1 },
          updatedAt: new Date()
        },
        create: {
          keyword: searchTerm,
          count: 1
        }
      })
      
      logger.info('Search keyword tracked', {
        requestId,
        keyword: searchTerm,
        resultsFound: totalCount
      })
    } catch (error) {
      logger.warn('Failed to track search keyword', {
        requestId,
        keyword: searchTerm,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    const duration = Date.now() - startTime
    
    logger.info('Search completed', {
      requestId,
      query: searchTerm,
      type: params.type,
      resultsCount: results.length,
      totalCount,
      duration
    })
    
    metrics.recordApiCall('search', 'GET', 'success', duration)

    return NextResponse.json({
      success: true,
      data: {
        results,
        query: searchTerm,
        type: params.type,
        pagination: {
          page: params.page,
          limit: params.limit,
          totalCount,
          totalPages,
          hasMore: params.page < totalPages,
        },
        stats: {
          posts: results.filter(r => r.type === 'post').length,
          users: results.filter(r => r.type === 'user').length,
          total: totalCount,
        },
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof z.ZodError) {
      logger.warn('Search validation failed', {
        requestId,
        errors: error.errors,
        duration
      })
      
      return NextResponse.json(
        { 
          success: false,
          error: error.errors[0].message 
        },
        { status: 400 }
      )
    }

    logger.error('Search failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    })
    
    metrics.recordApiCall('search', 'GET', 'error', duration)
    
    return NextResponse.json(
      { 
        success: false,
        error: '검색 중 오류가 발생했습니다' 
      },
      { status: 500 }
    )
  }
}