import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logging'
import { metrics } from '@/lib/metrics'

interface TrendingKeywordScore {
  keyword: string
  score: number
  sources: {
    search: number
    posts: number
    questions: number
    views: number
  }
}

// 노이즈 키워드 필터링
const NOISE_KEYWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', '그', '이', '저', '를', '을', '가', '이',
  '은', '는', '의', '에', '에서', '로', '으로', '와', '과', '하고'
])

// 실시간 트렌딩 키워드 조회 (검색어 + 컨텐츠 분석 기반)
export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  try {
    logger.info('Trending keywords fetch started', { requestId })
    
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const keywordScores: Record<string, TrendingKeywordScore> = {}
    
    // 1. 검색 키워드 분석 (최근 24시간 가중치 높음)
    try {
      const searchKeywords = await prisma.searchKeyword.findMany({
        where: {
          updatedAt: {
            gte: sevenDaysAgo
          }
        },
        orderBy: { count: 'desc' },
        take: 50
      })
      
      searchKeywords.forEach(search => {
        const cleanKeyword = search.keyword.trim().toLowerCase()
        if (cleanKeyword && cleanKeyword.length > 1 && !NOISE_KEYWORDS.has(cleanKeyword)) {
          const recentBonus = search.updatedAt >= oneDayAgo ? 2.0 : 1.0
          const score = search.count * 10 * recentBonus
          
          if (!keywordScores[cleanKeyword]) {
            keywordScores[cleanKeyword] = {
              keyword: cleanKeyword,
              score: 0,
              sources: { search: 0, posts: 0, questions: 0, views: 0 }
            }
          }
          keywordScores[cleanKeyword].score += score
          keywordScores[cleanKeyword].sources.search += score
        }
      })
    } catch (error) {
      logger.warn('Search keyword analysis failed, skipping', { requestId, error: error instanceof Error ? error.message : 'Unknown' })
    }
    
    // 2. 게시물 태그 + 제목 분석
    const popularPosts = await prisma.post.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: 'PUBLISHED'
      },
      include: {
        _count: {
          select: { likes: true, comments: true }
        }
      },
      orderBy: [
        { viewCount: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 100
    })

    popularPosts.forEach(post => {
      const recentBonus = post.createdAt >= oneDayAgo ? 1.5 : 1.0
      const engagementScore = (post._count.likes * 3) + (post.viewCount * 0.1) + (post._count.comments * 2)
      
      // 태그에서 키워드 추출
      if (post.tags) {
        const tags = post.tags.split(',').filter(Boolean)
        tags.forEach(tag => {
          const cleanTag = tag.trim().toLowerCase()
          if (cleanTag && cleanTag.length > 1 && !NOISE_KEYWORDS.has(cleanTag)) {
            const score = engagementScore * 0.8 * recentBonus
            
            if (!keywordScores[cleanTag]) {
              keywordScores[cleanTag] = {
                keyword: cleanTag,
                score: 0,
                sources: { search: 0, posts: 0, questions: 0, views: 0 }
              }
            }
            keywordScores[cleanTag].score += score
            keywordScores[cleanTag].sources.posts += score
          }
        })
      }
      
      // 제목에서 키워드 추출 (간단한 토큰화)
      const titleWords = post.title.split(/[\s\.,\!\?\-\(\)\[\]]+/)
        .filter(word => word.length > 2 && !NOISE_KEYWORDS.has(word.toLowerCase()))
      
      titleWords.forEach(word => {
        const cleanWord = word.toLowerCase()
        if (cleanWord.length > 2 && !NOISE_KEYWORDS.has(cleanWord)) {
          const score = engagementScore * 0.3 * recentBonus
          
          if (!keywordScores[cleanWord]) {
            keywordScores[cleanWord] = {
              keyword: cleanWord,
              score: 0,
              sources: { search: 0, posts: 0, questions: 0, views: 0 }
            }
          }
          keywordScores[cleanWord].score += score
          keywordScores[cleanWord].sources.posts += score
        }
      })
    })

    // 3. Q&A 분석
    const popularQuestions = await prisma.question.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      include: {
        _count: {
          select: { likes: true, answers: true }
        }
      },
      orderBy: [
        { viewCount: 'desc' },
        { likeCount: 'desc' }
      ],
      take: 50
    })

    popularQuestions.forEach(question => {
      const recentBonus = question.createdAt >= oneDayAgo ? 1.5 : 1.0
      const engagementScore = (question.likeCount * 4) + (question.viewCount * 0.2) + (question._count.answers * 3) + (question.bounty * 0.1)
      
      if (question.tags) {
        const tags = question.tags.split(',').filter(Boolean)
        tags.forEach(tag => {
          const cleanTag = tag.trim().toLowerCase()
          if (cleanTag && cleanTag.length > 1 && !NOISE_KEYWORDS.has(cleanTag)) {
            const score = engagementScore * 0.9 * recentBonus
            
            if (!keywordScores[cleanTag]) {
              keywordScores[cleanTag] = {
                keyword: cleanTag,
                score: 0,
                sources: { search: 0, posts: 0, questions: 0, views: 0 }
              }
            }
            keywordScores[cleanTag].score += score
            keywordScores[cleanTag].sources.questions += score
          }
        })
      }
    })

    // 4. 상위 키워드 선택 및 정규화
    const sortedKeywords = Object.values(keywordScores)
      .filter(item => item.score > 1) // 최소 스코어 필터
      .sort((a, b) => b.score - a.score)
      .slice(0, 15) // 상위 15개
      .map(item => item.keyword)

    // 5. 폴백 키워드 (데이터가 부족한 경우)
    const defaultKeywords = [
      'seo', '디지털마케팅', '소셜미디어', '콘텐츠마케팅', '인공지능',
      'kpi', '전환율', '고객획득', 'roi', '브랜딩', '퍼포먼스마케팅',
      '데이터분석', '온라인광고', '마케팅자동화', '고객경험'
    ]

    const finalKeywords = sortedKeywords.length >= 8 ? sortedKeywords.slice(0, 10) : [
      ...sortedKeywords,
      ...defaultKeywords.filter(k => !sortedKeywords.includes(k))
    ].slice(0, 10)

    const duration = Date.now() - startTime
    
    logger.info('Trending keywords fetch completed', {
      requestId,
      keywordCount: finalKeywords.length,
      postsAnalyzed: popularPosts.length,
      questionsAnalyzed: popularQuestions.length,
      searchKeywordsAnalyzed: Object.keys(keywordScores).filter(k => keywordScores[k].sources.search > 0).length,
      duration
    })
    
    metrics.recordApiCall('trending_keywords', 'GET', 'success', duration)

    return NextResponse.json({
      success: true,
      keywords: finalKeywords,
      meta: {
        postsAnalyzed: popularPosts.length,
        questionsAnalyzed: popularQuestions.length,
        period: '7일',
        lastUpdated: now.toISOString(),
        sources: ['검색어', '게시물', '질문답변', '조회수']
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Trending keywords fetch failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    })
    
    metrics.recordApiCall('trending_keywords', 'GET', 'error', duration)
    
    // 폴백 응답
    const fallbackKeywords = [
      'seo', '디지털마케팅', '소셜미디어', '콘텐츠마케팅', '인공지능',
      'kpi', '전환율', '고객획득', 'roi', '브랜딩'
    ]
    
    return NextResponse.json({
      success: true,
      keywords: fallbackKeywords,
      meta: {
        postsAnalyzed: 0,
        questionsAnalyzed: 0,
        period: '7일',
        lastUpdated: new Date().toISOString(),
        fallback: true,
        error: '일시적 오류로 기본 키워드를 제공합니다'
      }
    })
  }
}