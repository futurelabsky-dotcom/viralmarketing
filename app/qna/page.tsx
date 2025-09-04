'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare, Search, Plus, CheckCircle, Clock, ThumbsUp } from 'lucide-react'

interface QnAItem {
  id: string
  title: string
  content: string
  category: string
  author: {
    name: string
    avatar?: string
    level: string
  }
  createdAt: string
  views: number
  likes: number
  replies: number
  status: 'open' | 'answered' | 'closed'
  tags: string[]
}

export default function QnAPage() {
  const [questions, setQuestions] = useState<QnAItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  // Mock Q&A data
  const mockQuestions: QnAItem[] = [
    {
      id: '1',
      title: '구글 애드센스 승인이 계속 거부되는데 어떻게 해야 할까요?',
      content: '블로그를 운영한 지 3개월 정도 되었는데 구글 애드센스 승인이 계속 거부됩니다. 콘텐츠 품질도 신경쓰고 있는데 무엇이 문제일까요?',
      category: 'adsense',
      author: {
        name: '마케팅초보',
        level: '새싹'
      },
      createdAt: '2024-09-04',
      views: 234,
      likes: 12,
      replies: 8,
      status: 'answered',
      tags: ['애드센스', '승인', '블로그']
    },
    {
      id: '2',
      title: 'Facebook 광고 CTR이 너무 낮습니다. 개선 방법을 알려주세요.',
      content: '페이스북 광고를 진행하고 있는데 CTR이 0.5% 정도로 너무 낮습니다. 타게팅도 세밀하게 했는데 무엇이 문제일까요?',
      category: 'facebook-ads',
      author: {
        name: '광고쟁이',
        level: '중급'
      },
      createdAt: '2024-09-04',
      views: 189,
      likes: 15,
      replies: 5,
      status: 'open',
      tags: ['페이스북광고', 'CTR', '타게팅']
    },
    {
      id: '3',
      title: 'SEO 최적화를 위한 키워드 리서치 도구 추천해주세요',
      content: 'SEO를 시작하려고 하는데 어떤 키워드 리서치 도구를 사용하는 것이 좋을까요? 무료와 유료 도구 모두 궁금합니다.',
      category: 'seo',
      author: {
        name: 'SEO학습자',
        level: '초급'
      },
      createdAt: '2024-09-03',
      views: 345,
      likes: 23,
      replies: 12,
      status: 'answered',
      tags: ['SEO', '키워드리서치', '도구추천']
    },
    {
      id: '4',
      title: '인스타그램 인플루언서 마케팅 계약 시 주의사항은?',
      content: '처음으로 인플루언서 마케팅을 진행하려고 합니다. 계약서 작성이나 협업 시 주의해야 할 점들을 알려주세요.',
      category: 'influencer',
      author: {
        name: '브랜드매니저',
        level: '중급'
      },
      createdAt: '2024-09-03',
      views: 156,
      likes: 8,
      replies: 3,
      status: 'open',
      tags: ['인플루언서', '계약', '인스타그램']
    },
    {
      id: '5',
      title: '이메일 마케팅 오픈율을 높이는 방법',
      content: '뉴스레터를 발송하고 있는데 오픈율이 10% 정도로 낮습니다. 제목이나 발송 시간 등 개선할 수 있는 방법이 있을까요?',
      category: 'email',
      author: {
        name: '콘텐츠마케터',
        level: '중급'
      },
      createdAt: '2024-09-02',
      views: 278,
      likes: 19,
      replies: 7,
      status: 'answered',
      tags: ['이메일마케팅', '오픈율', '뉴스레터']
    }
  ]

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'seo', name: 'SEO' },
    { id: 'facebook-ads', name: 'Facebook 광고' },
    { id: 'adsense', name: '애드센스' },
    { id: 'influencer', name: '인플루언서' },
    { id: 'email', name: '이메일 마케팅' },
    { id: 'analytics', name: '분석/측정' }
  ]

  const statusFilters = [
    { id: 'all', name: '전체' },
    { id: 'open', name: '답변대기' },
    { id: 'answered', name: '답변완료' },
    { id: 'closed', name: '종료' }
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setQuestions(mockQuestions)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredQuestions = questions.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'answered':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />답변완료</Badge>
      case 'closed':
        return <Badge variant="secondary">종료</Badge>
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />답변대기</Badge>
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case '새싹': return 'text-green-600'
      case '초급': return 'text-blue-600'
      case '중급': return 'text-purple-600'
      case '고급': return 'text-orange-600'
      case '전문가': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Q&A</h1>
              <p className="text-gray-600">마케팅 관련 궁금한 점을 질문하고 답변받으세요</p>
            </div>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              질문하기
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="질문 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
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
              
              <div className="border-l border-gray-300 mx-2"></div>
              
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((status) => (
                  <Button
                    key={status.id}
                    variant={selectedStatus === status.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStatus(status.id)}
                  >
                    {status.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredQuestions.length > 0 ? (
              <div className="space-y-4">
                {filteredQuestions.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(item.status)}
                          <Badge variant="outline" className="text-xs">
                            {categories.find(cat => cat.id === item.category)?.name}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{item.views} 조회</span>
                          <span>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                      
                      <CardTitle className="text-lg mb-3">
                        <Link href={`/qna/${item.id}`} className="hover:text-indigo-600">
                          {item.title}
                        </Link>
                      </CardTitle>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {item.content}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.author.avatar} />
                            <AvatarFallback className="text-xs">
                              {item.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{item.author.name}</p>
                            <p className={`text-xs ${getLevelColor(item.author.level)}`}>
                              {item.author.level}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {item.likes}
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {item.replies}
                          </div>
                          <Link href={`/qna/${item.id}`}>
                            <Button variant="ghost" size="sm">
                              자세히 보기
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">검색 결과가 없습니다.</p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setSelectedStatus('all')
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