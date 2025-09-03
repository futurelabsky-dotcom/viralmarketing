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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, AlertCircle, Save, History, Palette, Image as ImageIcon } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface LogoData {
  id?: string
  siteName: string
  logoImageUrl?: string
  faviconUrl?: string
  brandColor?: string
  description?: string
  version?: number
  createdAt?: string
  creator?: {
    id: string
    name: string
    nickname: string
  }
}

interface LogoFormData {
  siteName: string
  logoImageUrl: string
  faviconUrl: string
  brandColor: string
  description: string
}

export default function LogoManagementPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentLogo, setCurrentLogo] = useState<LogoData | null>(null)
  const [logoHistory, setLogoHistory] = useState<LogoData[]>([])
  
  const [formData, setFormData] = useState<LogoFormData>({
    siteName: '마케팅 커뮤니티',
    logoImageUrl: '',
    faviconUrl: '',
    brandColor: '#0066cc',
    description: '마케터와 사업자를 위한 종합 플랫폼'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewColor, setPreviewColor] = useState('#0066cc')

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchCurrentLogo()
      fetchLogoHistory()
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

  const fetchCurrentLogo = async () => {
    try {
      const response = await fetch('/api/logo')
      const data = await response.json()
      
      if (data.success && data.logo) {
        setCurrentLogo(data.logo)
        setFormData({
          siteName: data.logo.siteName || '마케팅 커뮤니티',
          logoImageUrl: data.logo.logoImageUrl || '',
          faviconUrl: data.logo.faviconUrl || '',
          brandColor: data.logo.brandColor || '#0066cc',
          description: data.logo.description || '마케터와 사업자를 위한 종합 플랫폼'
        })
        setPreviewColor(data.logo.brandColor || '#0066cc')
      }
    } catch (error) {
      console.error('로고 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogoHistory = async () => {
    try {
      const response = await fetch('/api/logo/history', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        setLogoHistory(data.logos || [])
      }
    } catch (error) {
      console.error('로고 히스토리 로딩 실패:', error)
    }
  }

  const handleInputChange = (field: keyof LogoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'brandColor') {
      setPreviewColor(value)
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.siteName.trim()) {
      newErrors.siteName = '사이트명을 입력해주세요'
    }

    if (formData.logoImageUrl && !isValidUrl(formData.logoImageUrl)) {
      newErrors.logoImageUrl = '올바른 이미지 URL을 입력해주세요'
    }

    if (formData.faviconUrl && !isValidUrl(formData.faviconUrl)) {
      newErrors.faviconUrl = '올바른 파비콘 URL을 입력해주세요'
    }

    if (formData.brandColor && !/^#[0-9A-Fa-f]{6}$/.test(formData.brandColor)) {
      newErrors.brandColor = '올바른 HEX 색상 코드를 입력해주세요 (예: #FF0000)'
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

    setSaving(true)

    try {
      const response = await fetch('/api/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          siteName: formData.siteName,
          logoImageUrl: formData.logoImageUrl || undefined,
          faviconUrl: formData.faviconUrl || undefined,
          brandColor: formData.brandColor || undefined,
          description: formData.description || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await fetchCurrentLogo()
        await fetchLogoHistory()
        setErrors({ success: '로고가 성공적으로 업데이트되었습니다!' })
        
        // 페이지 새로고침으로 헤더 로고 업데이트
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setErrors({ submit: data.error || '로고 업데이트에 실패했습니다' })
      }
    } catch (error) {
      console.error('로고 업데이트 오류:', error)
      setErrors({ submit: '로고 업데이트 중 오류가 발생했습니다' })
    } finally {
      setSaving(false)
    }
  }

  const getInitial = (siteName: string) => {
    return siteName.charAt(0).toUpperCase()
  }

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
          
          <h1 className="text-3xl font-bold text-gray-900">로고 관리</h1>
          <p className="text-gray-600 mt-2">
            사이트의 브랜딩과 로고를 관리합니다
          </p>
        </div>

        <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 설정 폼 */}
              <Card>
                <CardHeader>
                  <CardTitle>로고 설정</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">사이트명 *</Label>
                      <Input
                        id="siteName"
                        value={formData.siteName}
                        onChange={(e) => handleInputChange('siteName', e.target.value)}
                        placeholder="마케팅 커뮤니티"
                        className={errors.siteName ? 'border-red-500' : ''}
                      />
                      {errors.siteName && (
                        <p className="text-sm text-red-500">{errors.siteName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logoImageUrl">로고 이미지 URL</Label>
                      <Input
                        id="logoImageUrl"
                        value={formData.logoImageUrl}
                        onChange={(e) => handleInputChange('logoImageUrl', e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className={errors.logoImageUrl ? 'border-red-500' : ''}
                      />
                      {errors.logoImageUrl && (
                        <p className="text-sm text-red-500">{errors.logoImageUrl}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        비워두면 브랜드 컬러와 첫 글자로 로고가 생성됩니다
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="faviconUrl">파비콘 URL</Label>
                      <Input
                        id="faviconUrl"
                        value={formData.faviconUrl}
                        onChange={(e) => handleInputChange('faviconUrl', e.target.value)}
                        placeholder="https://example.com/favicon.ico"
                        className={errors.faviconUrl ? 'border-red-500' : ''}
                      />
                      {errors.faviconUrl && (
                        <p className="text-sm text-red-500">{errors.faviconUrl}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brandColor">브랜드 컬러</Label>
                      <div className="flex gap-2">
                        <Input
                          id="brandColor"
                          value={formData.brandColor}
                          onChange={(e) => handleInputChange('brandColor', e.target.value)}
                          placeholder="#0066cc"
                          className={`flex-1 ${errors.brandColor ? 'border-red-500' : ''}`}
                        />
                        <div 
                          className="w-12 h-10 rounded border border-gray-300"
                          style={{ backgroundColor: previewColor }}
                        />
                      </div>
                      {errors.brandColor && (
                        <p className="text-sm text-red-500">{errors.brandColor}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        HEX 형식으로 입력하세요 (예: #FF0000)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">사이트 설명</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="마케터와 사업자를 위한 종합 플랫폼"
                        rows={3}
                      />
                    </div>

                    {/* 오류 및 성공 메시지 */}
                    {errors.submit && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.submit}</AlertDescription>
                      </Alert>
                    )}

                    {errors.success && (
                      <Alert className="border-green-500 bg-green-50">
                        <Save className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          {errors.success}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" disabled={saving} className="w-full">
                      {saving ? (
                        <>저장 중...</>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          로고 설정 저장
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* 미리보기 */}
              <Card>
                <CardHeader>
                  <CardTitle>미리보기</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 헤더 미리보기 */}
                  <div>
                    <h3 className="font-semibold mb-3">헤더에서의 모습</h3>
                    <div className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center space-x-2">
                        {formData.logoImageUrl ? (
                          <div className="relative h-8 w-8 flex-shrink-0">
                            <Image
                              src={formData.logoImageUrl}
                              alt={formData.siteName}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div 
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white font-bold text-lg flex-shrink-0"
                            style={{ backgroundColor: previewColor }}
                          >
                            {getInitial(formData.siteName)}
                          </div>
                        )}
                        <span className="font-bold">
                          {formData.siteName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 현재 설정 */}
                  <div>
                    <h3 className="font-semibold mb-3">현재 적용된 설정</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">사이트명:</span>
                        <span className="font-medium">{currentLogo?.siteName || '설정되지 않음'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">로고 이미지:</span>
                        <span className="font-medium">
                          {currentLogo?.logoImageUrl ? '설정됨' : '미설정'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">브랜드 컬러:</span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: currentLogo?.brandColor || '#0066cc' }}
                          />
                          <span className="font-mono text-xs">
                            {currentLogo?.brandColor || '#0066cc'}
                          </span>
                        </div>
                      </div>
                      {currentLogo?.version && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">버전:</span>
                          <Badge variant="outline">v{currentLogo.version}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>

          {/* 변경 히스토리 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                변경 히스토리
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logoHistory.length > 0 ? (
                <div className="space-y-4">
                  {logoHistory.map((logo) => (
                    <div key={logo.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {logo.logoImageUrl ? (
                            <div className="relative h-6 w-6">
                              <Image
                                src={logo.logoImageUrl}
                                alt={logo.siteName}
                                fill
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <div 
                              className="flex h-6 w-6 items-center justify-center rounded text-white font-bold text-sm"
                              style={{ backgroundColor: logo.brandColor || '#0066cc' }}
                            >
                              {getInitial(logo.siteName)}
                            </div>
                          )}
                          <span className="font-medium">{logo.siteName}</span>
                          <Badge variant="outline">v{logo.version}</Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {logo.createdAt && formatDate(logo.createdAt)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {logo.description}
                      </div>
                      {logo.creator && (
                        <div className="text-xs text-gray-500 mt-2">
                          작성자: {logo.creator.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  변경 히스토리가 없습니다.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}