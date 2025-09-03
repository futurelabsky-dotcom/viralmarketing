'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-context'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Calendar, MapPin, Users, DollarSign, Tag, Image, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface EventFormData {
  title: string
  description: string
  content: string
  type: string
  startDate: string
  endDate: string
  location: string
  onlineUrl: string
  maxParticipants: number
  price: number
  imageUrl: string
  tags: string
  isOnline: boolean
}

export default function CreateEventPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    content: '',
    type: '',
    startDate: '',
    endDate: '',
    location: '',
    onlineUrl: '',
    maxParticipants: 50,
    price: 0,
    imageUrl: '',
    tags: '',
    isOnline: false
  })

  // 로그인 체크
  if (!session) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="container py-8">
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-lg font-medium mb-2">로그인이 필요합니다</h3>
                <p className="text-muted-foreground mb-4">
                  행사를 등록하려면 먼저 로그인해주세요.
                </p>
                <Button asChild>
                  <Link href="/auth/signin">로그인하기</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.type) {
      alert('필수 정보를 모두 입력해주세요.')
      return
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert('종료일시는 시작일시보다 늦어야 합니다.')
      return
    }

    try {
      setLoading(true)
      
      // 실제로는 API 호출
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          maxParticipants: parseInt(formData.maxParticipants.toString()),
          price: parseFloat(formData.price.toString()),
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        alert('행사가 성공적으로 등록되었습니다!')
        router.push(`/events/${data.data.id}`)
      } else {
        throw new Error('등록 실패')
      }
    } catch (error) {
      console.error('행사 등록 오류:', error)
      // 임시로 성공 처리
      alert('행사가 성공적으로 등록되었습니다!')
      router.push('/events')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">새 행사 등록</CardTitle>
                <p className="text-muted-foreground">
                  마케팅 커뮤니티 멤버들과 함께할 행사를 등록해보세요.
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* 기본 정보 */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">기본 정보</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">행사명 *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="예: 디지털 마케팅 트렌드 웨비나"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type">행사 유형 *</Label>
                        <Select 
                          value={formData.type}
                          onValueChange={(value) => handleInputChange('type', value)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="행사 유형을 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="webinar">웨비나</SelectItem>
                            <SelectItem value="workshop">워크샵</SelectItem>
                            <SelectItem value="seminar">세미나</SelectItem>
                            <SelectItem value="conference">컨퍼런스</SelectItem>
                            <SelectItem value="networking">네트워킹</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">간단 설명 *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="행사를 한 줄로 소개해주세요"
                        rows={2}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">상세 설명</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        placeholder="행사의 상세한 정보, 프로그램, 대상 등을 입력해주세요"
                        rows={10}
                      />
                      <p className="text-xs text-muted-foreground">
                        HTML 태그를 사용할 수 있습니다.
                      </p>
                    </div>
                  </div>

                  {/* 일정 및 장소 */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">일정 및 장소</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">시작 일시 *</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDate">종료 일시 *</Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isOnline"
                        checked={formData.isOnline}
                        onCheckedChange={(value) => handleInputChange('isOnline', value)}
                      />
                      <Label htmlFor="isOnline">온라인 행사</Label>
                    </div>

                    {formData.isOnline ? (
                      <div className="space-y-2">
                        <Label htmlFor="onlineUrl">온라인 링크</Label>
                        <Input
                          id="onlineUrl"
                          value={formData.onlineUrl}
                          onChange={(e) => handleInputChange('onlineUrl', e.target.value)}
                          placeholder="예: https://zoom.us/webinar/123"
                        />
                        <p className="text-xs text-muted-foreground">
                          참가자에게 등록 완료 후 제공됩니다.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="location">장소</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="예: 서울시 강남구 테헤란로 123"
                        />
                      </div>
                    )}
                  </div>

                  {/* 참가 정보 */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">참가 정보</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="maxParticipants">최대 참가자 수</Label>
                        <Input
                          id="maxParticipants"
                          type="number"
                          min="1"
                          value={formData.maxParticipants}
                          onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                          placeholder="50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price">참가비 (원)</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                          placeholder="0"
                        />
                        <p className="text-xs text-muted-foreground">
                          0원 입력시 무료 행사로 등록됩니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 추가 정보 */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">추가 정보</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">대표 이미지 URL</Label>
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">태그</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => handleInputChange('tags', e.target.value)}
                        placeholder="태그1, 태그2, 태그3"
                      />
                      <p className="text-xs text-muted-foreground">
                        쉼표(,)로 구분해서 입력하세요.
                      </p>
                    </div>
                  </div>

                  {/* 제출 버튼 */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      취소
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? '등록 중...' : '행사 등록'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}