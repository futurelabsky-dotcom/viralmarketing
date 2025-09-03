'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/lib/auth-context'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Settings, Users, Shield, AlertCircle, CheckCircle } from 'lucide-react'

export default function PermissionsManagementPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  // 관리자 권한 체크
  if (status === 'authenticated' && !session?.user?.isAdmin) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="container py-8">
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-lg font-medium mb-2">접근 권한이 없습니다</h3>
                <p className="text-muted-foreground mb-4">
                  이 페이지는 관리자만 접근할 수 있습니다.
                </p>
                <Button asChild>
                  <Link href="/">홈으로 돌아가기</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const handleInitializePermissions = async () => {
    try {
      setLoading(true)
      setError('')
      setMessage('')

      const response = await fetch('/api/admin/permissions/init', {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        setInitialized(true)
        setMessage(data.message)
      } else {
        setError(data.error || '권한 시스템 초기화에 실패했습니다')
      }
    } catch (error) {
      console.error('Permission initialization error:', error)
      setError('권한 시스템 초기화 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        로딩 중...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                관리자 페이지
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">권한 관리</h1>
          </div>
          <p className="text-gray-600">
            사용자 역할과 권한을 체계적으로 관리합니다
          </p>
        </div>

        {/* 시스템 초기화 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              권한 시스템 설정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                권한 기반 접근 제어 시스템을 초기화합니다. 기본 역할(일반 사용자, 모더레이터, 관리자)과 
                권한들이 생성되며, 현재 관리자 계정에 전체 권한이 부여됩니다.
              </p>

              {message && (
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleInitializePermissions}
                disabled={loading || initialized}
                className="w-full md:w-auto"
              >
                {loading ? '초기화 중...' : initialized ? '초기화 완료' : '권한 시스템 초기화'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 권한 시스템 개요 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                기본 역할
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Badge variant="default" className="mb-2">일반 사용자</Badge>
                  <p className="text-sm text-gray-600">기본 커뮤니티 기능 사용</p>
                </div>
                <div>
                  <Badge variant="secondary" className="mb-2">모더레이터</Badge>
                  <p className="text-sm text-gray-600">컨텐츠 관리 및 중재 권한</p>
                </div>
                <div>
                  <Badge variant="destructive" className="mb-2">관리자</Badge>
                  <p className="text-sm text-gray-600">전체 시스템 관리 권한</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Shield className="h-5 w-5 mr-2 text-green-500" />
                권한 카테고리
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline">게시글 관리</Badge>
                <Badge variant="outline">댓글 관리</Badge>
                <Badge variant="outline">Q&A 관리</Badge>
                <Badge variant="outline">템플릿 관리</Badge>
                <Badge variant="outline">이벤트 관리</Badge>
                <Badge variant="outline">사용자 관리</Badge>
                <Badge variant="outline">시스템 관리</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Settings className="h-5 w-5 mr-2 text-purple-500" />
                관리 기능
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>• 역할별 권한 설정</p>
                <p>• 사용자 역할 부여</p>
                <p>• 세분화된 권한 제어</p>
                <p>• 감사 로그 추적</p>
                <p>• 권한 변경 이력</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 상세 권한 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>권한 상세 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3">게시글 관련</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 게시글 읽기</li>
                  <li>• 게시글 작성</li>
                  <li>• 게시글 수정</li>
                  <li>• 게시글 삭제</li>
                  <li>• 게시글 관리 (타인 게시글)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3">사용자 관리</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 사용자 조회</li>
                  <li>• 사용자 수정</li>
                  <li>• 사용자 정지</li>
                  <li>• 사용자 삭제</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3">시스템 관리</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 관리자 대시보드</li>
                  <li>• 통계 및 분석</li>
                  <li>• 배너 관리</li>
                  <li>• 로고 관리</li>
                  <li>• 권한 관리</li>
                  <li>• 시스템 설정</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {initialized && (
          <div className="mt-8">
            <Alert className="border-blue-500 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                권한 시스템이 성공적으로 초기화되었습니다! 이제 세분화된 권한 관리를 사용할 수 있습니다.
                기존의 isAdmin 필드는 하위 호환성을 위해 유지됩니다.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}