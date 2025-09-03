import { NextRequest, NextResponse } from 'next/server'
import { PermissionsService } from '@/lib/permissions'
import { verifyJWT } from '@/lib/auth-jwt'
import { prisma } from '@/lib/db'

// 권한 시스템 초기화 (슈퍼 관리자만)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다' },
        { status: 401 }
      )
    }

    // 사용자 권한 확인 (기존 isAdmin 또는 슈퍼 관리자)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { isAdmin: true, email: true }
    })

    // 슈퍼 관리자나 기존 관리자만 권한 시스템 초기화 가능
    if (!user?.isAdmin && user?.email !== 'admin@marketing-community.com') {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다' },
        { status: 403 }
      )
    }

    // 권한 시스템 초기화
    await PermissionsService.initializePermissions()

    // 현재 사용자에게 admin 역할 부여
    await PermissionsService.assignRole(payload.userId, 'admin', payload.userId)

    return NextResponse.json({
      success: true,
      message: '권한 시스템이 성공적으로 초기화되었습니다'
    })
  } catch (error) {
    console.error('Permission system initialization failed:', error)
    return NextResponse.json(
      { success: false, error: '권한 시스템 초기화 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}