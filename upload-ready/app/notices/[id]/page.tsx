'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Eye, User, ArrowLeft, Pin, Bell, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Notice {
  id: string
  title: string
  content: string
  excerpt: string
  author: {
    id: string
    name: string
    nickname: string
    image?: string
  }
  createdAt: string
  updatedAt: string
  viewCount: number
  isPinned: boolean
  priority: 'high' | 'medium' | 'low'
  category: string
  status: 'published' | 'draft'
}

export default function NoticeDetailPage() {
  const params = useParams()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchNotice()
  }, [params.id])

  const fetchNotice = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 임시 데이터 (실제로는 API 호출)
      const mockNotices: Record<string, Notice> = {
        '1': {
          id: '1',
          title: '마케팅 커뮤니티 서비스 오픈 안내',
          content: `
            <h2>마케팅 커뮤니티 정식 오픈을 축하합니다!</h2>
            
            <p>안녕하세요, 마케팅 전문가 여러분!</p>
            
            <p>드디어 <strong>마케팅 커뮤니티</strong>가 정식 서비스를 시작하게 되었습니다. 
            이곳은 마케팅 분야의 전문가들이 모여 지식과 경험을 공유하고, 함께 성장할 수 있는 플랫폼입니다.</p>
            
            <h3>주요 기능</h3>
            <ul>
              <li><strong>지식 공유</strong>: 마케팅 노하우와 사례를 자유롭게 공유하세요</li>
              <li><strong>Q&A</strong>: 궁금한 점을 질문하고 전문가들의 답변을 받아보세요</li>
              <li><strong>자료실</strong>: 유용한 마케팅 템플릿과 자료를 다운로드하세요</li>
              <li><strong>교육 프로그램</strong>: 온라인 강좌와 세미나에 참여하세요</li>
              <li><strong>네트워킹</strong>: 같은 분야의 전문가들과 네트워크를 구축하세요</li>
            </ul>
            
            <h3>포인트 시스템</h3>
            <p>커뮤니티 활동에 따라 포인트를 적립하고, 다양한 혜택을 누리세요:</p>
            <ul>
              <li>게시글 작성: 카테고리별 차등 포인트</li>
              <li>댓글 작성: 5포인트</li>
              <li>좋아요 받기: 3포인트</li>
              <li>답변 채택: 추가 포인트 지급</li>
            </ul>
            
            <p>많은 관심과 참여 부탁드립니다. 함께 만들어가는 마케팅 커뮤니티가 되겠습니다!</p>
            
            <p>감사합니다.</p>
            <p><strong>마케팅 커뮤니티 운영진</strong></p>
          `,
          excerpt: '마케팅 커뮤니티 정식 서비스 오픈을 알려드립니다.',
          author: {
            id: '1',
            name: '관리자',
            nickname: '관리자',
            image: '/default-avatar.svg'
          },
          createdAt: '2024-03-01T00:00:00Z',
          updatedAt: '2024-03-01T00:00:00Z',
          viewCount: 1249,
          isPinned: true,
          priority: 'high',
          category: 'service',
          status: 'published'
        },
        '2': {
          id: '2',
          title: '커뮤니티 이용 가이드라인',
          content: `
            <h2>건전한 커뮤니티 문화를 위한 가이드라인</h2>
            
            <p>모든 회원이 안전하고 유익한 환경에서 소통할 수 있도록 다음 가이드라인을 준수해 주시기 바랍니다.</p>
            
            <h3>1. 상호 존중</h3>
            <ul>
              <li>서로 다른 의견을 존중하고 건설적인 토론을 합시다</li>
              <li>욕설, 비방, 차별적 표현은 금지됩니다</li>
              <li>개인 정보 및 사생활 침해 금지</li>
            </ul>
            
            <h3>2. 콘텐츠 가이드라인</h3>
            <ul>
              <li>마케팅과 관련된 유익한 정보를 공유해 주세요</li>
              <li>광고성 게시물은 홍보 게시판에만 작성 가능합니다</li>
              <li>저작권을 침해하는 콘텐츠는 금지됩니다</li>
              <li>허위 정보나 스팸 게시물은 삭제됩니다</li>
            </ul>
            
            <h3>3. 커뮤니티 활동</h3>
            <ul>
              <li>질문은 구체적이고 명확하게 작성해 주세요</li>
              <li>답변은 정확하고 도움이 되는 내용으로 작성해 주세요</li>
              <li>중복 게시물은 피해주세요</li>
            </ul>
            
            <h3>4. 제재 정책</h3>
            <p>가이드라인을 위반할 경우 다음과 같은 제재가 있을 수 있습니다:</p>
            <ul>
              <li>1차: 경고 및 해당 게시물 삭제</li>
              <li>2차: 1주일 활동 정지</li>
              <li>3차: 1개월 활동 정지</li>
              <li>심각한 위반: 영구 정지</li>
            </ul>
            
            <p>문의사항이 있으시면 언제든 관리자에게 연락주세요.</p>
          `,
          excerpt: '모든 사용자가 지켜야 할 커뮤니티 가이드라인입니다.',
          author: {
            id: '1',
            name: '관리자',
            nickname: '관리자',
            image: '/default-avatar.svg'
          },
          createdAt: '2024-02-28T00:00:00Z',
          updatedAt: '2024-02-28T00:00:00Z',
          viewCount: 857,
          isPinned: true,
          priority: 'high',
          category: 'guideline',
          status: 'published'
        },
        '3': {
          id: '3',
          title: '포인트 시스템 운영 정책',
          content: `
            <h2>포인트 시스템 안내</h2>
            
            <p>커뮤니티 활동을 통해 포인트를 적립하고 다양한 혜택을 누려보세요!</p>
            
            <h3>포인트 적립 방법</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="border: 1px solid #dee2e6; padding: 12px;">활동</th>
                  <th style="border: 1px solid #dee2e6; padding: 12px;">포인트</th>
                  <th style="border: 1px solid #dee2e6; padding: 12px;">설명</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">자유게시판 글 작성</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">10P</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">일반적인 정보 공유</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">질문답변 글 작성</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">20P</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">전문적인 질문 또는 답변</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">사례공유 글 작성</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">50P</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">실무 경험 공유</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">구인구직 글 작성</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">100P</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">채용 정보 또는 구직 정보</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">홍보 글 작성</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">200P</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">제품/서비스 홍보</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">댓글 작성</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">5P</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">의미있는 댓글</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">좋아요 받기</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">3P</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">다른 사용자로부터 좋아요</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">답변 채택</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">보너스</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">질문자가 답변을 채택한 경우</td>
                </tr>
              </tbody>
            </table>
            
            <h3>포인트 사용처</h3>
            <ul>
              <li><strong>자료 다운로드</strong>: 유료 템플릿 및 자료 구매</li>
              <li><strong>질문 현상금</strong>: 빠른 답변을 위한 포인트 지급</li>
              <li><strong>프리미엄 기능</strong>: 추후 출시 예정</li>
              <li><strong>오프라인 이벤트</strong>: 할인 혜택 제공</li>
            </ul>
            
            <h3>주의사항</h3>
            <ul>
              <li>스팸성 게시물로 판단될 경우 포인트가 차감될 수 있습니다</li>
              <li>중복 게시물 작성 시 포인트가 지급되지 않습니다</li>
              <li>부적절한 콘텐츠는 삭제와 함께 포인트가 회수됩니다</li>
            </ul>
            
            <p>포인트 시스템에 대한 문의는 관리자에게 연락주세요.</p>
          `,
          excerpt: '포인트 적립 방법과 사용처에 대한 안내입니다.',
          author: {
            id: '1',
            name: '관리자',
            nickname: '관리자',
            image: '/default-avatar.svg'
          },
          createdAt: '2024-02-25T00:00:00Z',
          updatedAt: '2024-02-25T00:00:00Z',
          viewCount: 643,
          isPinned: false,
          priority: 'medium',
          category: 'policy',
          status: 'published'
        }
      }
      
      const noticeData = mockNotices[params.id as string]
      if (!noticeData) {
        setError('공지사항을 찾을 수 없습니다.')
        return
      }
      
      // 조회수 증가 (실제로는 API 호출)
      noticeData.viewCount += 1
      setNotice(noticeData)
      
    } catch (error) {
      console.error('공지사항 로딩 오류:', error)
      setError('공지사항을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'service': return 'bg-blue-100 text-blue-800'
      case 'guideline': return 'bg-purple-100 text-purple-800'
      case 'policy': return 'bg-orange-100 text-orange-800'
      case 'event': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !notice) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">공지사항을 찾을 수 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              {error || '요청하신 공지사항이 존재하지 않거나 삭제되었습니다.'}
            </p>
            <Link href="/notices">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                공지사항 목록으로
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* 상단 네비게이션 */}
      <div className="mb-6">
        <Link href="/notices">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            공지사항 목록
          </Button>
        </Link>
      </div>

      {/* 공지사항 내용 */}
      <Card className={notice.isPinned ? "border-l-4 border-l-red-500" : ""}>
        <CardContent className="p-8">
          {/* 헤더 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              {notice.isPinned && <Pin className="h-4 w-4 text-red-600" />}
              <Badge 
                variant="secondary"
                className={getPriorityBadgeColor(notice.priority)}
              >
                {notice.priority === 'high' && '긴급'}
                {notice.priority === 'medium' && '중요'}
                {notice.priority === 'low' && '일반'}
              </Badge>
              <Badge 
                variant="outline"
                className={getCategoryBadgeColor(notice.category)}
              >
                {notice.category === 'service' && '서비스'}
                {notice.category === 'guideline' && '가이드라인'}
                {notice.category === 'policy' && '정책'}
                {notice.category === 'event' && '이벤트'}
              </Badge>
            </div>
            
            <h1 className="text-2xl font-bold mb-4">{notice.title}</h1>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground border-b pb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{notice.author.nickname || notice.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>작성일: {formatDate(notice.createdAt)}</span>
              </div>
              {notice.createdAt !== notice.updatedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>수정일: {formatDate(notice.updatedAt)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>조회 {notice.viewCount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 본문 */}
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: notice.content }} />
          </div>
        </CardContent>
      </Card>

      {/* 하단 네비게이션 */}
      <div className="mt-8 text-center">
        <Link href="/notices">
          <Button variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            공지사항 목록으로
          </Button>
        </Link>
      </div>
    </div>
  )
}