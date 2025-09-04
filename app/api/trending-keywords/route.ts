import { NextRequest, NextResponse } from 'next/server'

// 모의 트렌딩 키워드 데이터
const mockKeywords = [
  '디지털마케팅',
  'SNS광고',
  '브랜딩',
  'SEO최적화',
  '콘텐츠마케팅',
  '퍼포먼스마케팅',
  '인플루언서',
  '바이럴마케팅',
  'KPI',
  '마케팅자동화'
]

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      keywords: mockKeywords,
      meta: {
        postsAnalyzed: 100,
        questionsAnalyzed: 50,
        period: '7일',
        lastUpdated: new Date().toISOString(),
        sources: ['검색어', '게시물', '질문답변', '조회수']
      }
    })
  } catch (error) {
    console.error('트렌딩 키워드 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '키워드 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}