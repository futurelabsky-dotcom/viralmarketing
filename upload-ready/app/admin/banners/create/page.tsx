'use client'

import { useState } from 'react'
import { useSession } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, AlertCircle, Save } from 'lucide-react'

interface BannerFormData {
  title: string
  subtitle: string
  description: string
  imageUrl: string
  linkUrl: string
  buttonText: string
  isActive: boolean
  order: number
  startDate: string
  endDate: string
}

export default function CreateBannerPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    buttonText: '',
    isActive: true,
    order: 0,
    startDate: '',
    endDate: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // 관리자 권한 체크
  if (!session?.user?.isAdmin) {
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

  const handleInputChange = (field: keyof BannerFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요'
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = '올바른 이미지 URL을 입력해주세요'
    }

    if (formData.linkUrl && !isValidUrl(formData.linkUrl)) {
      newErrors.linkUrl = '올바른 링크 URL을 입력해주세요'
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = '종료일은 시작일보다 늦어야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          subtitle: formData.subtitle || undefined,
          description: formData.description || undefined,
          imageUrl: formData.imageUrl || undefined,
          linkUrl: formData.linkUrl || undefined,
          buttonText: formData.buttonText || undefined,
          isActive: formData.isActive,
          order: formData.order,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/admin/banners')
      } else {
        setErrors({ submit: data.error || '배너 생성에 실패했습니다' })
      }
    } catch (error) {
      console.error('배너 생성 오류:', error)
      setErrors({ submit: '배너 생성 중 오류가 발생했습니다' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/banners">
                <ArrowLeft className="h-4 w-4 mr-2" />
                배너 관리로 돌아가기
              </Link>
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">새 배너 만들기</h1>
          <p className="text-gray-600 mt-2">
            홈페이지에 표시될 히어로 배너를 생성합니다
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>배너 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">기본 정보</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">제목 *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="배너 제목을 입력하세요"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitle">부제목</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => handleInputChange('subtitle', e.target.value)}
                      placeholder="부제목 (선택사항)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="배너에 대한 상세 설명"
                    rows={3}
                  />
                </div>
              </div>

              {/* 이미지 및 링크 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">이미지 및 링크</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">배경 이미지 URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={errors.imageUrl ? 'border-red-500' : ''}
                  />
                  {errors.imageUrl && (
                    <p className="text-sm text-red-500">{errors.imageUrl}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    배너의 배경으로 사용할 이미지 URL을 입력하세요
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkUrl">연결 링크 URL</Label>
                    <Input
                      id="linkUrl"
                      value={formData.linkUrl}
                      onChange={(e) => handleInputChange('linkUrl', e.target.value)}
                      placeholder="https://example.com"
                      className={errors.linkUrl ? 'border-red-500' : ''}
                    />
                    {errors.linkUrl && (
                      <p className="text-sm text-red-500">{errors.linkUrl}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buttonText">버튼 텍스트</Label>
                    <Input
                      id="buttonText"
                      value={formData.buttonText}
                      onChange={(e) => handleInputChange('buttonText', e.target.value)}
                      placeholder="자세히 보기"
                    />
                  </div>
                </div>
              </div>

              {/* 설정 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">설정</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order">표시 순서</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-sm text-gray-500">
                      숫자가 작을수록 먼저 표시됩니다
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>활성 상태</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(value) => handleInputChange('isActive', value)}
                      />
                      <Label htmlFor="isActive" className="text-sm font-normal">
                        배너 활성화
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">시작일</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">종료일</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className={errors.endDate ? 'border-red-500' : ''}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-red-500">{errors.endDate}</p>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-500">
                  시작일과 종료일을 설정하지 않으면 배너가 계속 표시됩니다
                </p>
              </div>

              {/* 오류 메시지 */}
              {errors.submit && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}

              {/* 버튼 */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  취소
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>생성 중...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      배너 생성
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}