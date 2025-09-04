import { NextRequest, NextResponse } from 'next/server'

interface SignInRequest {
  email: string
  password: string
}

// OPTIONS 메서드 지원 추가
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(request: NextRequest) {
  // CORS 헤더 추가
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // OPTIONS 요청 처리
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders })
  }
  try {
    const { email, password }: SignInRequest = await request.json()

    // 입력 검증
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 데모 계정 체크
    if (email === 'demo@example.com' && password === 'demo123') {
      return NextResponse.json({
        success: true,
        message: '로그인 성공',
        user: {
          id: 'demo-user',
          email: 'demo@example.com',
          name: '데모 사용자',
          role: 'user'
        },
        token: 'demo-token'
      }, { headers: corsHeaders })
    }

    // Mock 로그인 처리
    // 실제 구현에서는 여기서 데이터베이스 확인 및 비밀번호 해시 비교
    
    // 임시로 모든 유효한 이메일 형식을 허용
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailRegex.test(email) && password.length >= 1) {
      return NextResponse.json({
        success: true,
        message: '로그인 성공',
        user: {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: '테스트 사용자',
          role: 'user'
        },
        token: Math.random().toString(36).substr(2, 20)
      }, { headers: corsHeaders })
    }

    // 로그인 실패
    return NextResponse.json(
      { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}// Force rebuild 2025년 09월  4일 목 오후  1:10:32
