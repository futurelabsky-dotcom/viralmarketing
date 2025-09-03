import { NextRequest, NextResponse } from 'next/server'
import { AuditService } from '@/lib/permissions'
import { verifyJWT } from '@/lib/auth-jwt'
import { prisma } from '@/lib/db'

// 감사 로그 조회 (관리자만)
export async function GET(req: NextRequest) {
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

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { isAdmin: true, isActive: true }
    })

    if (!user?.isActive) {
      return NextResponse.json(
        { success: false, error: '비활성화된 계정입니다' },
        { status: 403 }
      )
    }

    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const action = searchParams.get('action')
    const resourceType = searchParams.get('resourceType')
    const userId = searchParams.get('userId')

    const offset = (page - 1) * limit

    const { logs, total } = await AuditService.getAuditLogs({
      userId,
      action,
      resourceType,
      limit,
      offset
    })

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Audit logs fetch failed:', error)
    return NextResponse.json(
      { success: false, error: '감사 로그 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}