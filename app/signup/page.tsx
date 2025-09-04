'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // 기본 검증
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 6자리 이상이어야 합니다.')
      return
    }

    setLoading(true)

    try {
      // 지연 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 클라이언트 사이드 회원가입 검증
      const isValidEmail = formData.email.includes('@') && formData.email.includes('.')
      const isValidName = formData.name.length >= 2

      if (!isValidEmail) {
        setError('올바른 이메일 형식을 입력해주세요.')
        return
      }

      if (!isValidName) {
        setError('이름은 2자리 이상 입력해주세요.')
        return
      }

      // 회원가입 성공 처리
      const userData = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.name,
        role: 'user'
      }

      // 가입 정보 저장 (실제로는 데이터베이스에 저장)
      localStorage.setItem('registered_user', JSON.stringify(userData))
      
      setSuccess('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.')
      
      setTimeout(() => {
        router.push('/auth/signin?message=회원가입이 완료되었습니다. 로그인해주세요.')
      }, 1500)
      
    } catch (error) {
      console.error('Signup error:', error)
      setError('회원가입 중 오류가 발생했습니다.')
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
              <CardTitle className="text-2xl text-center">회원가입</CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                마케팅 커뮤니티에 참여하세요
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="이름을 입력하세요"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

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
                      placeholder="비밀번호를 입력하세요 (6자리 이상)"
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="비밀번호를 다시 입력하세요"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="terms"
                    type="checkbox"
                    className="rounded border-gray-300"
                    required
                  />
                  <Label htmlFor="terms" className="text-sm">
                    <Link href="/terms" className="text-primary hover:underline">
                      이용약관
                    </Link>
                    {' '}및{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      개인정보처리방침
                    </Link>
                    에 동의합니다
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '가입 중...' : '회원가입'}
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
                    이미 계정이 있으신가요?{' '}
                    <Link href="/auth/signin" className="text-primary hover:underline">
                      로그인
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 참고사항 */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-medium mb-2">알림</h3>
                <p className="text-sm text-muted-foreground">
                  현재 데모 버전으로 실제 계정 생성은 되지 않습니다.<br />
                  테스트용 데모 계정을 사용해주세요.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
