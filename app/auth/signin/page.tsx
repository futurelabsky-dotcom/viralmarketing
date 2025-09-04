'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const urlMessage = searchParams?.get('message')
    if (urlMessage) {
      setMessage(urlMessage)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 클라이언트 사이드 인증으로 완전 변경
      const isValidEmail = formData.email.includes('@') && formData.email.includes('.')
      const isValidPassword = formData.password.length >= 3

      if (!isValidEmail) {
        setError('올바른 이메일 형식을 입력해주세요.')
        return
      }

      if (!isValidPassword) {
        setError('비밀번호는 3자리 이상 입력해주세요.')
        return
      }

      // 데모 계정 체크
      if (formData.email === 'demo@example.com' && formData.password === 'demo123') {
        const userData = {
          id: 'demo-user',
          email: 'demo@example.com',
          name: '데모 사용자',
          role: 'user'
        }
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', 'demo-token-' + Date.now())
        
        setSuccess('로그인 성공! 홈페이지로 이동합니다.')
        setTimeout(() => {
          router.push('/')
        }, 1500)
        return
      }

      // 모든 유효한 이메일 형식 허용
      const userData = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.email.includes('demo') ? '데모 사용자' : '마케팅 사용자',
        role: 'user'
      }

      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', 'client-token-' + Date.now())
      
      setSuccess('로그인 성공! 홈페이지로 이동합니다.')
      setTimeout(() => {
        router.push('/')
      }, 1500)
      
    } catch (error) {
      console.error('Login error:', error)
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* 뒤로가기 버튼 */}
          <div className="mb-6">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                홈으로 돌아가기
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">로그인</CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                마케팅 커뮤니티에 오신 것을 환영합니다
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {message && (
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="이메일을 입력하세요"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="비밀번호를 입력하세요"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="remember" className="text-sm">
                      로그인 정보 저장
                    </Label>
                  </div>
                  <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    비밀번호 찾기
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '로그인 중...' : '로그인'}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">또는</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    계정이 없으신가요?{' '}
                    <Link href="/" className="text-primary hover:underline">
                      홈으로 가서 회원가입
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 데모 계정 정보 */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-medium mb-2">데모 계정</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  테스트용 계정으로 로그인해보세요
                </p>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <p><strong>이메일:</strong> demo@example.com</p>
                  <p><strong>비밀번호:</strong> demo123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}