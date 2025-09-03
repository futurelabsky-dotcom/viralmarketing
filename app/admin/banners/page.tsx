'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/lib/auth-context'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, Calendar, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Banner {
  id: string
  title: string
  subtitle?: string
  description?: string
  imageUrl?: string
  linkUrl?: string
  buttonText?: string
  isActive: boolean
  order: number
  startDate?: string
  endDate?: string
  createdAt: string
  creator: {
    id: string
    name: string
    nickname: string
  }
}

export default function BannersAdminPage() {
  const { data: session, status } = useSession()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchBanners()
    }
  }, [session])

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

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/banners')
      const data = await response.json()
      
      if (data.success) {
        setBanners(data.banners || [])
      } else {
        console.error('배너 로딩 실패:', data.error)
      }
    } catch (error) {
      console.error('배너 로딩 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (bannerId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/banners/${bannerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        fetchBanners() // 목록 새로고침
      } else {
        const data = await response.json()
        alert(data.error || '상태 변경에 실패했습니다')
      }
    } catch (error) {
      console.error('배너 상태 변경 오류:', error)
      alert('상태 변경 중 오류가 발생했습니다')
    }
  }

  const handleDelete = async (bannerId: string) => {
    try {
      const response = await fetch(`/api/banners/${bannerId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        fetchBanners() // 목록 새로고침
      } else {
        const data = await response.json()
        alert(data.error || '삭제에 실패했습니다')
      }
    } catch (error) {
      console.error('배너 삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다')
    }
  }

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading' || loading) {
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
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">배너 관리</h1>
              <p className="text-gray-600 mt-2">
                홈페이지 히어로 섹션의 슬라이드 배너를 관리합니다
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/banners/create">
                <Plus className="h-4 w-4 mr-2" />
                새 배너 만들기
              </Link>
            </Button>
          </div>

          {/* 검색 */}
          <div className="max-w-md">
            <Input
              placeholder="배너 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 배너 목록 */}
        {filteredBanners.length > 0 ? (
          <div className="grid gap-6">
            {filteredBanners.map((banner) => (
              <Card key={banner.id} className="overflow-hidden">
                <div className="flex">
                  {/* 이미지 미리보기 */}
                  <div className="w-48 h-32 relative bg-gray-100 flex-shrink-0">
                    {banner.imageUrl ? (
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        이미지 없음
                      </div>
                    )}
                  </div>

                  {/* 배너 정보 */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold">{banner.title}</h3>
                          <Badge variant={banner.isActive ? "default" : "secondary"}>
                            {banner.isActive ? '활성' : '비활성'}
                          </Badge>
                          <Badge variant="outline">
                            순서: {banner.order}
                          </Badge>
                        </div>
                        
                        {banner.subtitle && (
                          <p className="text-sm text-blue-600 mb-1">{banner.subtitle}</p>
                        )}
                        
                        {banner.description && (
                          <p className="text-gray-600 mb-2">{banner.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>작성자: {banner.creator.name}</span>
                          <span>생성일: {formatDate(banner.createdAt)}</span>
                          {banner.linkUrl && (
                            <span className="flex items-center">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              링크 연결됨
                            </span>
                          )}
                        </div>
                        
                        {(banner.startDate || banner.endDate) && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {banner.startDate && `시작: ${formatDate(banner.startDate)}`}
                            {banner.startDate && banner.endDate && ' ~ '}
                            {banner.endDate && `종료: ${formatDate(banner.endDate)}`}
                          </div>
                        )}
                      </div>

                      {/* 액션 버튼들 */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={banner.isActive}
                            onCheckedChange={() => handleToggleActive(banner.id, banner.isActive)}
                          />
                          <span className="text-sm text-gray-500">
                            {banner.isActive ? '활성' : '비활성'}
                          </span>
                        </div>
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/banners/${banner.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>배너 삭제</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{banner.title}" 배너를 삭제하시겠습니까?
                                이 작업은 되돌릴 수 없습니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(banner.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                삭제
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Plus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              배너가 없습니다
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? '검색 조건에 맞는 배너를 찾을 수 없습니다.' 
                : '아직 생성된 배너가 없습니다.'}
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link href="/admin/banners/create">
                  <Plus className="h-4 w-4 mr-2" />
                  첫 배너 만들기
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}