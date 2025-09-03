'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/lib/auth-context'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, FileText, User, Calendar, Filter } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface AuditLog {
  id: string
  action: string
  resource?: string
  resourceType?: string
  oldValue?: string
  newValue?: string
  ipAddress?: string
  userAgent?: string
  metadata?: string
  createdAt: string
  user?: {
    id: string
    name: string
    email: string
    nickname: string
  }
}

export default function AuditLogsPage() {
  const { data: session, status } = useSession()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [resourceTypeFilter, setResourceTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchAuditLogs()
    }
  }, [session, page, actionFilter, resourceTypeFilter])

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

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      
      if (actionFilter) params.append('action', actionFilter)
      if (resourceTypeFilter) params.append('resourceType', resourceTypeFilter)
      
      const response = await fetch(`/api/admin/audit?${params}`, {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.logs || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        console.error('감사 로그 로딩 실패:', data.error)
      }
    } catch (error) {
      console.error('감사 로그 로딩 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    const colorMap: Record<string, string> = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      login: 'bg-purple-100 text-purple-800',
      logout: 'bg-gray-100 text-gray-800'
    }
    
    const actionType = action.split(':')[1] || action.split('_')[1] || 'default'
    const className = colorMap[actionType.toLowerCase()] || 'bg-gray-100 text-gray-800'
    
    return (
      <Badge variant="secondary" className={className}>
        {action}
      </Badge>
    )
  }

  const filteredLogs = logs.filter(log =>
    searchTerm === '' || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      
      <div className="container mx-auto px-4 py-8">
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
            <FileText className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">감사 로그</h1>
          </div>
          <p className="text-gray-600">
            시스템 내 모든 중요 활동을 추적하고 기록합니다
          </p>
        </div>

        {/* 필터 및 검색 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Filter className="h-5 w-5 mr-2" />
              필터 및 검색
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="사용자 또는 액션 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="액션 필터" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">전체 액션</SelectItem>
                    <SelectItem value="create">생성</SelectItem>
                    <SelectItem value="update">수정</SelectItem>
                    <SelectItem value="delete">삭제</SelectItem>
                    <SelectItem value="login">로그인</SelectItem>
                    <SelectItem value="logout">로그아웃</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="리소스 타입" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">전체 리소스</SelectItem>
                    <SelectItem value="user">사용자</SelectItem>
                    <SelectItem value="post">게시글</SelectItem>
                    <SelectItem value="comment">댓글</SelectItem>
                    <SelectItem value="template">템플릿</SelectItem>
                    <SelectItem value="event">이벤트</SelectItem>
                    <SelectItem value="banner">배너</SelectItem>
                    <SelectItem value="logo">로고</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Button 
                  onClick={() => {
                    setSearchTerm('')
                    setActionFilter('')
                    setResourceTypeFilter('')
                    setPage(1)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  필터 초기화
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 감사 로그 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>감사 로그 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">로딩 중...</div>
            ) : filteredLogs.length > 0 ? (
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getActionBadge(log.action)}
                        <div>
                          <p className="font-medium text-sm">
                            {log.user ? `${log.user.name} (${log.user.email})` : '시스템'}
                          </p>
                          {log.resourceType && (
                            <p className="text-xs text-gray-500">
                              {log.resourceType} {log.resource && `#${log.resource}`}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(log.createdAt)}
                        </div>
                        {log.ipAddress && (
                          <p className="text-xs text-gray-400">IP: {log.ipAddress}</p>
                        )}
                      </div>
                    </div>
                    
                    {(log.oldValue || log.newValue) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {log.oldValue && (
                            <div>
                              <p className="font-medium text-gray-600 mb-1">변경 전:</p>
                              <pre className="bg-red-50 p-2 rounded text-xs overflow-auto max-h-20">
                                {JSON.stringify(JSON.parse(log.oldValue), null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.newValue && (
                            <div>
                              <p className="font-medium text-gray-600 mb-1">변경 후:</p>
                              <pre className="bg-green-50 p-2 rounded text-xs overflow-auto max-h-20">
                                {JSON.stringify(JSON.parse(log.newValue), null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {log.metadata && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">
                          추가 정보 보기
                        </summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || actionFilter || resourceTypeFilter 
                  ? '검색 조건에 맞는 감사 로그가 없습니다.'
                  : '감사 로그가 없습니다.'
                }
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
            
            <div className="flex items-center gap-2">
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
            </div>
            
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

      <Footer />
    </div>
  )
}