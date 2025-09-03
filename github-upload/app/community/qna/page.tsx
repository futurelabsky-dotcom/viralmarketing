'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  MessageSquare, 
  Clock, 
  User,
  Eye,
  Star,
  Filter,
  Plus,
  TrendingUp,
  Award
} from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'

interface Question {
  id: string
  title: string
  content: string
  points: number
  status: string
  viewCount: number
  answerCount: number
  likeCount: number
  isResolved: boolean
  createdAt: string
  author: {
    id: string
    name: string
    nickname: string
    image?: string
  }
  category: {
    id: string
    name: string
    slug: string
  }
  tags: string[]
}

export default function CommunityQnAPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchQuestions()
  }, [page, sortBy, filterStatus])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sort: sortBy
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (filterStatus) params.append('status', filterStatus)
      
      const response = await fetch(`/api/qna/questions?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setQuestions(data.questions || [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('질문 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchQuestions()
  }

  const getStatusBadge = (status: string, isResolved: boolean) => {
    if (isResolved) {
      return <Badge className="bg-green-500">해결됨</Badge>
    }
    
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default">진행중</Badge>
      case 'CLOSED':
        return <Badge variant="secondary">종료됨</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">커뮤니티 Q&A</h1>
              <p className="text-gray-600 mt-2">
                궁금한 점을 질문하고 전문가의 답변을 받아보세요
              </p>
            </div>
            <Button asChild>
              <Link href="/qna/write">
                <Plus className="mr-2 h-4 w-4" />
                질문하기
              </Link>
            </Button>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">홈</Link>
            <span className="mx-2">/</span>
            <Link href="/community" className="hover:text-blue-600">커뮤니티</Link>
            <span className="mx-2">/</span>
            <span className="text-blue-600">Q&A</span>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="질문 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">검색</Button>
              </form>
              
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">최신순</SelectItem>
                    <SelectItem value="points">포인트순</SelectItem>
                    <SelectItem value="views">조회순</SelectItem>
                    <SelectItem value="answers">답변순</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">전체</SelectItem>
                    <SelectItem value="active">진행중</SelectItem>
                    <SelectItem value="resolved">해결됨</SelectItem>
                    <SelectItem value="closed">종료됨</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* 질문 목록 */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  질문 목록
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-start space-x-4 p-4 border rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="flex space-x-4">
                              <div className="h-3 bg-gray-200 rounded w-16"></div>
                              <div className="h-3 bg-gray-200 rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : questions.length > 0 ? (
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <Link 
                        key={question.id} 
                        href={`/qna/${question.id}`}
                        className="block"
                      >
                        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusBadge(question.status, question.isResolved)}
                                <Badge variant="outline">{question.category.name}</Badge>
                                {question.points > 0 && (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                    <Star className="w-3 h-3 mr-1" />
                                    {question.points}P
                                  </Badge>
                                )}
                              </div>
                              
                              <h3 className="text-lg font-semibold mb-2 hover:text-blue-600">
                                {question.title}
                              </h3>
                              
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {question.content.substring(0, 150)}...
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Avatar className="w-5 h-5">
                                      <AvatarImage src={question.author.image || ''} />
                                      <AvatarFallback className="text-xs">
                                        {getInitials(question.author.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{question.author.nickname || question.author.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(question.createdAt)}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {question.viewCount}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    {question.answerCount}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">질문이 없습니다</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || filterStatus ? '검색 조건에 맞는 질문이 없습니다.' : '첫 번째 질문을 올려보세요!'}
                    </p>
                    <Button asChild>
                      <Link href="/qna/write">질문하기</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  이전
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  다음
                </Button>
              </div>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 질문하기 버튼 */}
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-8 w-8 mx-auto text-blue-500 mb-3" />
                <h3 className="font-semibold mb-2">궁금한 게 있나요?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  전문가들에게 질문하고 도움을 받아보세요
                </p>
                <Button asChild className="w-full">
                  <Link href="/qna/write">
                    <Plus className="mr-2 h-4 w-4" />
                    질문하기
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* 인기 태그 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">인기 태그</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  {['마케팅전략', 'SEO', '소셜미디어', '콘텐츠마케팅', '퍼포먼스마케팅', 'CRM'].map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-gray-300"
                      onClick={() => {
                        setSearchTerm(tag)
                        setPage(1)
                        fetchQuestions()
                      }}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 통계 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Q&A 통계</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">전체 질문</span>
                    </div>
                    <span className="font-semibold">1,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-green-500" />
                      <span className="text-sm">해결된 질문</span>
                    </div>
                    <span className="font-semibold">987</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">이번 주 질문</span>
                    </div>
                    <span className="font-semibold">45</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}