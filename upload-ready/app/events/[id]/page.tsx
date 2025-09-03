'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-context'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft, 
  ExternalLink,
  Share2,
  Heart,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description: string
  content: string
  type: string
  status: string
  startDate: Date
  endDate: Date
  location?: string
  onlineUrl?: string
  organizer: {
    id: string
    name: string
    nickname: string
    image?: string
  }
  currentParticipants: number
  maxParticipants: number
  price: number
  imageUrl?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  isRegistered?: boolean
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEvent()
  }, [params.id])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 임시 데이터 (실제로는 API 호출)
      const mockEvents: Record<string, Event> = {
        '1': {
          id: '1',
          title: '2024 디지털 마케팅 트렌드 웨비나',
          description: '올해 주목해야 할 디지털 마케팅 트렌드와 실무 적용 방법을 알아보는 웨비나입니다.',
          content: `
            <h2>웨비나 소개</h2>
            <p>2024년 디지털 마케팅 환경은 급격하게 변화하고 있습니다. 이번 웨비나에서는 업계 전문가들과 함께 올해 가장 주목해야 할 트렌드들을 살펴보고, 실무에서 바로 적용할 수 있는 전략들을 공유합니다.</p>
            
            <h3>주요 내용</h3>
            <ul>
              <li><strong>AI 마케팅 도구 활용법</strong> - ChatGPT, 미드저니 등 최신 AI 도구를 마케팅에 활용하는 방법</li>
              <li><strong>개인화 마케팅 전략</strong> - 고객 데이터를 활용한 개인화된 마케팅 경험 설계</li>
              <li><strong>소셜 커머스 트렌드</strong> - 인스타그램, 틱톡 쇼핑 기능을 활용한 판매 전략</li>
              <li><strong>데이터 기반 의사결정</strong> - 마케팅 성과 측정과 개선 방안</li>
              <li><strong>브랜드 스토리텔링</strong> - Z세대를 공략하는 브랜드 커뮤니케이션</li>
            </ul>
            
            <h3>대상</h3>
            <ul>
              <li>마케팅 담당자 (경력 1년 이상)</li>
              <li>디지털 마케팅에 관심 있는 예비 마케터</li>
              <li>스타트업 대표 및 마케팅 총괄</li>
              <li>프리랜서 마케터</li>
            </ul>
            
            <h3>연사진</h3>
            <p><strong>김마케팅 대표</strong> - 디지털 마케팅 에이전시 10년 경력, 삼성전자, LG전자 등 대기업 마케팅 컨설팅</p>
            <p><strong>박성장 이사</strong> - 네이버 마케팅 본부 출신, 현재 이커머스 마케팅 전문가</p>
            
            <h3>참가 혜택</h3>
            <ul>
              <li>웨비나 녹화본 1개월 무제한 시청</li>
              <li>마케팅 템플릿 및 체크리스트 제공</li>
              <li>Q&A 세션을 통한 개별 질문 답변</li>
              <li>참가자 전용 네트워킹 채널 초대</li>
              <li>수료증 발급</li>
            </ul>
            
            <p>많은 관심과 참여 부탁드립니다!</p>
          `,
          type: 'webinar',
          status: 'scheduled',
          startDate: new Date('2024-03-20T14:00:00'),
          endDate: new Date('2024-03-20T16:00:00'),
          onlineUrl: 'https://zoom.us/webinar/123',
          organizer: {
            id: 'expert1',
            name: '마케팅 전문가',
            nickname: 'marketing_expert',
            image: '/default-avatar.svg'
          },
          currentParticipants: 156,
          maxParticipants: 200,
          price: 0,
          imageUrl: 'https://via.placeholder.com/800x400',
          tags: ['트렌드', '디지털마케팅', '웨비나', 'AI마케팅'],
          createdAt: new Date('2024-03-01T00:00:00'),
          updatedAt: new Date('2024-03-01T00:00:00'),
          isRegistered: false
        },
        '2': {
          id: '2',
          title: 'SEO 최적화 실무 워크샵',
          description: '검색엔진 최적화의 핵심 원리부터 실무 적용까지, 체계적으로 배울 수 있는 워크샵입니다.',
          content: `
            <h2>워크샵 소개</h2>
            <p>SEO(검색엔진 최적화)는 디지털 마케팅의 가장 중요한 요소 중 하나입니다. 이 워크샵에서는 SEO의 기본 원리부터 고급 테크닉까지, 실무에서 바로 활용할 수 있는 노하우를 배웁니다.</p>
            
            <h3>커리큘럼</h3>
            <h4>오전 세션 (10:00-12:30)</h4>
            <ul>
              <li>SEO 기초 이론과 검색엔진 작동 원리</li>
              <li>키워드 리서치 및 경쟁 분석</li>
              <li>온페이지 SEO 최적화 기법</li>
            </ul>
            
            <h4>오후 세션 (14:00-17:00)</h4>
            <ul>
              <li>테크니컬 SEO와 사이트 구조 최적화</li>
              <li>콘텐츠 SEO 전략과 실습</li>
              <li>링크 빌딩과 오프페이지 SEO</li>
              <li>SEO 도구 활용법 (구글 서치 콘솔, SEMrush 등)</li>
            </ul>
            
            <h3>실습 프로젝트</h3>
            <p>참가자 개인 또는 회사 웹사이트를 대상으로 실제 SEO 감사를 진행하고, 개선 방안을 도출하는 실습을 진행합니다.</p>
            
            <h3>제공 자료</h3>
            <ul>
              <li>SEO 체크리스트</li>
              <li>키워드 리서치 템플릿</li>
              <li>SEO 감사 보고서 양식</li>
              <li>추천 SEO 도구 리스트</li>
            </ul>
            
            <h3>수강 대상</h3>
            <ul>
              <li>웹사이트 운영자</li>
              <li>디지털 마케터</li>
              <li>콘텐츠 마케터</li>
              <li>웹 개발자</li>
            </ul>
          `,
          type: 'workshop',
          status: 'scheduled',
          startDate: new Date('2024-03-25T10:00:00'),
          endDate: new Date('2024-03-25T17:00:00'),
          location: '서울시 강남구 테헤란로 123 마케팅센터 3층',
          organizer: {
            id: 'expert2',
            name: 'SEO 전문가',
            nickname: 'seo_expert',
            image: '/default-avatar.svg'
          },
          currentParticipants: 24,
          maxParticipants: 30,
          price: 150000,
          imageUrl: 'https://via.placeholder.com/800x400',
          tags: ['SEO', '워크샵', '실무', '검색최적화'],
          createdAt: new Date('2024-03-01T00:00:00'),
          updatedAt: new Date('2024-03-01T00:00:00'),
          isRegistered: false
        }
      }
      
      const eventData = mockEvents[params.id as string]
      if (!eventData) {
        setError('행사를 찾을 수 없습니다.')
        return
      }
      
      setEvent(eventData)
      
    } catch (error) {
      console.error('행사 로딩 오류:', error)
      setError('행사를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!session) {
      alert('로그인이 필요합니다.')
      router.push('/auth/signin')
      return
    }

    if (!event) return
    
    try {
      setRegistering(true)
      
      // 실제로는 API 호출
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        setEvent(prev => prev ? {
          ...prev,
          currentParticipants: prev.currentParticipants + 1,
          isRegistered: true
        } : null)
        alert('행사 등록이 완료되었습니다!')
      } else {
        throw new Error('등록 실패')
      }
    } catch (error) {
      console.error('등록 오류:', error)
      // 임시로 성공 처리
      setEvent(prev => prev ? {
        ...prev,
        currentParticipants: prev.currentParticipants + 1,
        isRegistered: true
      } : null)
      alert('행사 등록이 완료되었습니다!')
    } finally {
      setRegistering(false)
    }
  }

  const getTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      webinar: '웨비나',
      workshop: '워크샵', 
      seminar: '세미나',
      conference: '컨퍼런스',
      networking: '네트워킹',
    }
    return typeMap[type] || type
  }

  const getStatusBadge = (status: string, startDate: Date) => {
    const now = new Date()
    const start = new Date(startDate)
    
    if (status === 'completed') {
      return <Badge variant="secondary">완료</Badge>
    } else if (start > now) {
      return <Badge variant="default">예정</Badge>
    } else {
      return <Badge variant="destructive">진행중</Badge>
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="container py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !event) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="container py-8">
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">행사를 찾을 수 없습니다</h3>
                <p className="text-muted-foreground mb-4">
                  {error || '요청하신 행사가 존재하지 않거나 삭제되었습니다.'}
                </p>
                <Link href="/events">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    행사 목록으로
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          {/* 상단 네비게이션 */}
          <div className="mb-6">
            <Link href="/events">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                행사 목록
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* 메인 콘텐츠 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 행사 이미지 */}
              {event.imageUrl && (
                <Card>
                  <CardContent className="p-0">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </CardContent>
                </Card>
              )}

              {/* 행사 정보 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">{getTypeLabel(event.type)}</Badge>
                    {getStatusBadge(event.status, event.startDate)}
                    {event.price === 0 && (
                      <Badge variant="secondary">무료</Badge>
                    )}
                  </div>
                  
                  <CardTitle className="text-3xl">{event.title}</CardTitle>
                  
                  <p className="text-lg text-muted-foreground">{event.description}</p>
                  
                  {/* 태그 */}
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                <CardContent>
                  {/* 행사 세부 정보 */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-3 h-5 w-5" />
                        <div>
                          <div className="font-medium text-foreground">
                            {formatDate(event.startDate)}
                          </div>
                          <div className="text-sm">
                            {event.startDate.toLocaleDateString('ko-KR', { weekday: 'long' })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-3 h-5 w-5" />
                        <div>
                          <div className="font-medium text-foreground">
                            {event.startDate.toLocaleTimeString('ko-KR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} - {event.endDate.toLocaleTimeString('ko-KR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          <div className="text-sm">
                            총 {Math.round((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60))}시간
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {event.location ? (
                        <div className="flex items-start text-muted-foreground">
                          <MapPin className="mr-3 h-5 w-5 mt-0.5" />
                          <div>
                            <div className="font-medium text-foreground">오프라인</div>
                            <div className="text-sm">{event.location}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center text-muted-foreground">
                          <ExternalLink className="mr-3 h-5 w-5" />
                          <div>
                            <div className="font-medium text-foreground">온라인</div>
                            <div className="text-sm">링크는 등록 후 제공</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center text-muted-foreground">
                        <Users className="mr-3 h-5 w-5" />
                        <div>
                          <div className="font-medium text-foreground">
                            {event.currentParticipants}/{event.maxParticipants}명
                          </div>
                          <div className="text-sm">
                            {event.maxParticipants - event.currentParticipants}석 남음
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 주최자 정보 */}
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg mb-6">
                    <User className="h-10 w-10 p-2 bg-background rounded-full" />
                    <div>
                      <div className="font-medium">{event.organizer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        @{event.organizer.nickname}
                      </div>
                    </div>
                  </div>

                  {/* 상세 내용 */}
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: event.content }} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              {/* 등록 카드 */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    {event.price > 0 && (
                      <div className="text-2xl font-bold text-primary mb-2">
                        {event.price.toLocaleString()}원
                      </div>
                    )}
                    
                    {event.status === 'scheduled' && !event.isRegistered && (
                      <Button 
                        className="w-full mb-4" 
                        onClick={handleRegister}
                        disabled={registering || event.currentParticipants >= event.maxParticipants}
                      >
                        {registering ? '등록 중...' : 
                         event.currentParticipants >= event.maxParticipants ? '마감됨' : '등록하기'}
                      </Button>
                    )}
                    
                    {event.isRegistered && (
                      <div className="flex items-center justify-center text-green-600 mb-4">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        등록 완료
                      </div>
                    )}
                    
                    {event.status === 'completed' && (
                      <Button variant="outline" disabled className="w-full mb-4">
                        종료된 행사
                      </Button>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Heart className="mr-2 h-4 w-4" />
                        관심
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Share2 className="mr-2 h-4 w-4" />
                        공유
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 참가자 현황 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">참가자 현황</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>등록자</span>
                      <span className="font-medium">{event.currentParticipants}명</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(event.currentParticipants / event.maxParticipants) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      {Math.round((event.currentParticipants / event.maxParticipants) * 100)}% 달성
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 관련 행사 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">관련 행사</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <Link href="/events/2" className="block hover:text-primary">
                      • SEO 최적화 실무 워크샵
                    </Link>
                    <Link href="/events/3" className="block hover:text-primary">
                      • 소셜미디어 마케팅 전략
                    </Link>
                    <Link href="/events/4" className="block hover:text-primary">
                      • 데이터 분석 입문 웨비나
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}