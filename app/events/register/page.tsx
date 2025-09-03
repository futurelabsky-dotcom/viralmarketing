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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Calendar, MapPin, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description: string
  category: string
  startDate: string
  endDate: string
  location: string
  maxParticipants: number
  currentParticipants: number
  price: number
  isOnline: boolean
  status: string
}

export default function EventRegisterPage() {
  const { data: session, status } = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [registrationData, setRegistrationData] = useState({
    message: '',
    phone: '',
    company: '',
    position: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin')
    }
  }, [status])

  useEffect(() => {
    if (session) {
      fetchEvents()
    }
  }, [session])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?status=upcoming')
      const data = await response.json()
      
      if (data.success) {
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('이벤트 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event)
    setSuccess(false)
    setError('')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedEvent) return

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/events/${selectedEvent.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setRegistrationData({
          message: '',
          phone: '',
          company: '',
          position: ''
        })
        // 이벤트 목록 새로고침
        fetchEvents()
      } else {
        setError(data.error || '신청 중 오류가 발생했습니다')
      }
    } catch (error) {
      console.error('이벤트 신청 실패:', error)
      setError('신청 중 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
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
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/events">
                <ArrowLeft className="h-4 w-4 mr-2" />
                이벤트 목록
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">이벤트 참가 신청</h1>
          </div>
          <p className="text-gray-600">
            관심있는 이벤트에 참가 신청을 해보세요
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 이벤트 목록 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>참가 가능한 이벤트</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">로딩 중...</div>
                ) : events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div 
                        key={event.id} 
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedEvent?.id === event.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleEventSelect(event)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {event.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline">{event.category}</Badge>
                              {event.isOnline && <Badge variant="secondary">온라인</Badge>}
                              {event.price === 0 && <Badge variant="default">무료</Badge>}
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(event.startDate)} - {formatDate(event.endDate)}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.currentParticipants}/{event.maxParticipants}명
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4 text-right">
                            {event.price > 0 && (
                              <div className="text-lg font-bold text-blue-600">
                                {event.price.toLocaleString()}원
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              {event.maxParticipants - event.currentParticipants > 0 
                                ? `${event.maxParticipants - event.currentParticipants}자리 남음` 
                                : '마감'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    현재 참가 가능한 이벤트가 없습니다
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 신청 폼 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedEvent ? '참가 신청서' : '이벤트를 선택하세요'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEvent ? (
                  <>
                    {success && (
                      <Alert className="mb-6 border-green-500 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          이벤트 참가 신청이 완료되었습니다!
                        </AlertDescription>
                      </Alert>
                    )}

                    {error && (
                      <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* 선택된 이벤트 정보 */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">{selectedEvent.title}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(selectedEvent.startDate)} - {formatDate(selectedEvent.endDate)}
                        </div>
                        {selectedEvent.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {selectedEvent.location}
                          </div>
                        )}
                        {selectedEvent.price > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-blue-600">
                              참가비: {selectedEvent.price.toLocaleString()}원
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                      <div>
                        <Label htmlFor="phone">연락처 *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={registrationData.phone}
                          onChange={(e) => setRegistrationData(prev => ({
                            ...prev,
                            phone: e.target.value
                          }))}
                          placeholder="연락 가능한 전화번호"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="company">소속 기관/회사</Label>
                        <Input
                          id="company"
                          value={registrationData.company}
                          onChange={(e) => setRegistrationData(prev => ({
                            ...prev,
                            company: e.target.value
                          }))}
                          placeholder="선택사항"
                        />
                      </div>

                      <div>
                        <Label htmlFor="position">직책/직위</Label>
                        <Input
                          id="position"
                          value={registrationData.position}
                          onChange={(e) => setRegistrationData(prev => ({
                            ...prev,
                            position: e.target.value
                          }))}
                          placeholder="선택사항"
                        />
                      </div>

                      <div>
                        <Label htmlFor="message">신청 메시지</Label>
                        <Textarea
                          id="message"
                          value={registrationData.message}
                          onChange={(e) => setRegistrationData(prev => ({
                            ...prev,
                            message: e.target.value
                          }))}
                          placeholder="이벤트에 대한 질문이나 요청사항을 자유롭게 작성해주세요 (선택사항)"
                          rows={4}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={submitting || selectedEvent.currentParticipants >= selectedEvent.maxParticipants}
                      >
                        {submitting ? '신청 중...' : 
                         selectedEvent.currentParticipants >= selectedEvent.maxParticipants ? '신청 마감' : 
                         '참가 신청하기'}
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>왼쪽에서 참가하고 싶은 이벤트를 선택해주세요</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}