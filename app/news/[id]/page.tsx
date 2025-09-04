'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Calendar, Eye, Share2, BookmarkPlus, ThumbsUp } from 'lucide-react'

interface NewsDetail {
  id: string
  title: string
  summary: string
  content: string
  category: string
  publishedAt: string
  views: number
  likes: number
  author: {
    name: string
    avatar?: string
    role: string
  }
  tags: string[]
  image?: string
  relatedNews?: NewsDetail[]
}

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [news, setNews] = useState<NewsDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  const mockNewsDetail: NewsDetail = {
    id: params?.id as string || '1',
    title: '2024년 디지털 마케팅 트렌드 분석',
    summary: 'AI 기반 개인화, 음성 검색 최적화, 메타버스 마케팅 등 올해 주목해야 할 디지털 마케팅 트렌드를 분석합니다.',
    content: `
# 2024년 디지털 마케팅의 주요 변화

올해 디지털 마케팅 업계는 그 어느 때보다 빠른 변화를 겪고 있습니다. 특히 AI 기술의 발전과 소비자 행동 패턴의 변화가 마케팅 전략에 큰 영향을 미치고 있습니다.

## 1. AI 기반 개인화 마케팅

인공지능을 활용한 개인화 마케팅이 본격화되고 있습니다. 고객의 행동 데이터를 실시간으로 분석하여 맞춤형 콘텐츠를 제공하는 것이 더 이상 선택이 아닌 필수가 되었습니다.

### 주요 특징:
- 실시간 데이터 분석
- 예측 기반 콘텐츠 추천
- 개인화된 광고 메시지

## 2. 음성 검색 최적화 (VSO)

스마트 스피커와 음성 비서의 확산으로 음성 검색이 증가하면서, SEO 전략도 음성 검색에 맞게 변화하고 있습니다.

### 최적화 방법:
- 자연어 기반 키워드 최적화
- FAQ 형태의 콘텐츠 구성
- 지역 SEO 강화

## 3. 메타버스 마케팅

가상현실과 증강현실 기술의 발전으로 메타버스 플랫폼에서의 마케팅 기회가 확대되고 있습니다.

### 활용 사례:
- 가상 매장 운영
- 3D 제품 체험
- 메타버스 이벤트 개최

## 4. 개인정보 보호 강화

쿠키 없는 마케팅(Cookieless Marketing) 시대에 대비한 새로운 데이터 수집 및 활용 방법이 주목받고 있습니다.

### 대응 전략:
- 퍼스트 파티 데이터 확보
- 제로 파티 데이터 활용
- 컨텍스트 기반 광고

## 5. 숏폼 콘텐츠의 부상

TikTok, YouTube Shorts, Instagram Reels 등 숏폼 콘텐츠의 인기가 마케팅 전략에 큰 변화를 가져오고 있습니다.

### 성공 요인:
- 15초 이내 핵심 메시지 전달
- 트렌드 기반 콘텐츠 제작
- 인터랙티브 요소 활용

## 결론

2024년 디지털 마케팅은 기술 혁신과 소비자 행동 변화에 빠르게 적응하는 것이 핵심입니다. 특히 AI와 개인화 기술을 적극 활용하면서도 개인정보 보호 규정을 준수하는 균형잡힌 접근이 필요합니다.

마케터들은 이러한 트렌드를 이해하고 자신만의 전략을 수립하여 경쟁력을 확보해야 할 것입니다.
    `,
    category: 'trend',
    publishedAt: '2024-09-04',
    views: 1245,
    likes: 89,
    author: {
      name: '김마케팅',
      role: '디지털 마케팅 전문가'
    },
    tags: ['AI', '개인화', '음성검색', '메타버스', '숏폼']
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNews(mockNewsDetail)
      setLoading(false)
    }, 800)
  }, [params?.id])

  const handleLike = () => {
    setLiked(!liked)
    if (news) {
      setNews({
        ...news,
        likes: liked ? news.likes - 1 : news.likes + 1
      })
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news?.title,
        text: news?.summary,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 클립보드에 복사되었습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">뉴스를 찾을 수 없습니다</h1>
            <p className="text-gray-600 mb-8">요청하신 뉴스가 존재하지 않거나 삭제되었습니다.</p>
            <Link href="/news">
              <Button>뉴스 목록으로 돌아가기</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Button>
          </div>

          {/* Article Header */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary">
                  {news.category === 'trend' ? '트렌드' : news.category}
                </Badge>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {news.views.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(news.publishedAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>
              
              <CardTitle className="text-2xl md:text-3xl mb-4">
                {news.title}
              </CardTitle>
              
              <p className="text-lg text-gray-600 mb-6">
                {news.summary}
              </p>

              {/* Author & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={news.author.avatar} />
                    <AvatarFallback>
                      {news.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{news.author.name}</p>
                    <p className="text-sm text-gray-500">{news.author.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant={liked ? "default" : "outline"}
                    size="sm"
                    onClick={handleLike}
                  >
                    <ThumbsUp className={`h-4 w-4 mr-1 ${liked ? 'fill-current' : ''}`} />
                    {news.likes}
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={() => setBookmarked(!bookmarked)}>
                    <BookmarkPlus className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Article Content */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ 
                  __html: news.content.replace(/\n/g, '<br/>').replace(/## /g, '<h2>').replace(/<h2>/g, '<h2 class="text-xl font-bold mt-6 mb-4">').replace(/<\/h2>/g, '</h2>')
                }} />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {news.tags && news.tags.length > 0 && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h3 className="font-medium mb-3">태그</h3>
                <div className="flex flex-wrap gap-2">
                  {news.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related News */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">관련 뉴스</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: '2', title: '구글 광고 정책 업데이트 - 마케터가 알아야 할 변경사항', category: 'policy' },
                  { id: '3', title: 'SNS 마케팅 ROI 측정 방법론', category: 'strategy' }
                ].map((item) => (
                  <Link key={item.id} href={`/news/${item.id}`}>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {item.category === 'policy' ? '정책' : item.category === 'strategy' ? '전략' : item.category}
                      </Badge>
                      <h4 className="font-medium text-sm leading-tight">
                        {item.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}