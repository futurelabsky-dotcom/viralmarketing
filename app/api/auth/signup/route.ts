import { NextRequest, NextResponse } from 'next/server'

interface SignUpRequest {
  name: string
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password }: SignUpRequest = await request.json()

    // 입력 검증
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      )
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 6자리 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    // Mock 회원가입 처리 
    // 실제 구현에서는 여기서 데이터베이스에 사용자 생성
    
    // 중복 이메일 체크 (Mock)
    if (email === 'demo@example.com') {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      )
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role: 'user'
      }
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}