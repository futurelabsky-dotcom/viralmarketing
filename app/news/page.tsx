'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Eye, Search, TrendingUp } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  summary: string
  category: string
  publishedAt: string
  views: number
  image?: string
  featured?: boolean
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  // Mock news data
  const mockNews: NewsItem[] = [
    {
      id: '1',
      title: '2024년 디지털 마케팅 트렌드 분석',
      summary: 'AI 기반 개인화, 음성 검색 최적화, 메타버스 마케팅 등 올해 주목해야 할 디지털 마케팅 트렌드를 분석합니다.',
      category: 'trend',
      publishedAt: '2024-09-04',
      views: 1245,
      featured: true
    },
    {
      id: '2',
      title: '구글 광고 정책 업데이트 - 마케터가 알아야 할 변경사항',
      summary: '최근 발표된 구글 광고 정책 변경사항과 마케터들이 대응해야 할 방안을 정리했습니다.',
      category: 'policy',
      publishedAt: '2024-09-03',
      views: 892
    },
    {
      id: '3',
      title: 'SNS 마케팅 ROI 측정 방법론',
      summary: 'SNS 마케팅의 투자 대비 효과를 정확하게 측정하는 방법과 주요 KPI 설정 전략을 소개합니다.',
      category: 'strategy',
      publishedAt: '2024-09-02',
      views: 567
    },
    {
      id: '4',
      title: '콘텐츠 마케팅 성공 사례 분석',
      summary: '국내외 브랜드들의 콘텐츠 마케팅 성공 사례를 분석하고 실무에 적용할 수 있는 인사이트를 제공합니다.',
      category: 'case-study',
      publishedAt: '2024-09-01',
      views: 734
    },
    {
      id: '5',
      title: '이커머스 마케팅 자동화 도구 비교',
      summary: '주요 마케팅 자동화 도구들의 기능과 가격을 비교 분석하여 최적의 선택을 도와드립니다.',
      category: 'tool',
      publishedAt: '2024-08-31',
      views: 423
    }
  ]

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'trend', name: '트렌드' },
    { id: 'policy', name: '정책' },
    { id: 'strategy', name: '전략' },
    { id: 'case-study', name: '사례분석' },
    { id: 'tool', name: '도구/툴' }
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setNews(mockNews)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.summary.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredNews = news.filter(item => item.featured)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">마케팅 뉴스</h1>
            <p className="text-gray-600">최신 마케팅 트렌드와 업계 소식을 빠르게 전해드립니다</p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="뉴스 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Featured News */}
          {featuredNews.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                주요 뉴스
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {featuredNews.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">
                          {categories.find(cat => cat.id === item.category)?.name}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Eye className="h-4 w-4 mr-1" />
                          {item.views.toLocaleString()}
                        </div>
                      </div>
                      <CardTitle className="text-lg">
                        <Link href={`/news/${item.id}`} className="hover:text-indigo-600">
                          {item.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{item.summary}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(item.publishedAt).toLocaleDateString('ko-KR')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* News List */}
          <div>
            <h2 className="text-xl font-bold mb-6">전체 뉴스</h2>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {categories.find(cat => cat.id === item.category)?.name}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Eye className="h-4 w-4 mr-1" />
                          {item.views.toLocaleString()}
                        </div>
                      </div>
                      <CardTitle className="text-base leading-tight">
                        <Link href={`/news/${item.id}`} className="hover:text-indigo-600">
                          {item.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {item.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(item.publishedAt).toLocaleDateString('ko-KR')}
                        </div>
                        <Link href={`/news/${item.id}`}>
                          <Button variant="ghost" size="sm">
                            더보기
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">검색 결과가 없습니다.</p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}>
                  전체 보기
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}