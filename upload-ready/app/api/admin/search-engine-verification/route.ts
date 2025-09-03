import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { verifyJWT } from '@/lib/auth-jwt'
import { logger } from '@/lib/logging'
import { metrics } from '@/lib/metrics'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const verificationSchema = z.object({
  googleVerification: z.string().default(''),
  naverVerification: z.string().default(''),
  bingVerification: z.string().default(''),
  googleFileMethod: z.boolean().default(false),
  naverFileMethod: z.boolean().default(false),
  googleFileName: z.string().optional(),
  googleFileContent: z.string().optional(),
  naverFileName: z.string().optional(),
  naverFileContent: z.string().optional()
})

// 검색엔진 인증 설정 조회
export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  try {
    logger.info('Search engine verification fetch started', { requestId })
    
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
      where: { id: payload.userId, isActive: true },
      select: { id: true, isAdmin: true }
    })

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    // 최신 검색엔진 인증 설정 조회
    const verification = await prisma.searchEngineVerification.findFirst({
      orderBy: { updatedAt: 'desc' }
    })

    const result = verification || {
      googleVerification: '',
      naverVerification: '',
      bingVerification: '',
      googleFileMethod: false,
      naverFileMethod: false,
      googleFileName: '',
      googleFileContent: '',
      naverFileName: '',
      naverFileContent: ''
    }

    const duration = Date.now() - startTime
    
    logger.info('Search engine verification fetch completed', {
      requestId,
      userId: user.id,
      duration
    })
    
    metrics.recordApiCall('search_engine_verification', 'GET', 'success', duration)

    return NextResponse.json({
      success: true,
      verification: result
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Search engine verification fetch failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    })
    
    metrics.recordApiCall('search_engine_verification', 'GET', 'error', duration)
    
    return NextResponse.json(
      { success: false, error: '검색엔진 인증 설정 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 검색엔진 인증 설정 저장
export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  try {
    logger.info('Search engine verification update started', { requestId })
    
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
      where: { id: payload.userId, isActive: true },
      select: { id: true, isAdmin: true }
    })

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = verificationSchema.parse(body)

    // 인증 파일 생성
    const publicPath = path.join(process.cwd(), 'public')
    
    try {
      await mkdir(publicPath, { recursive: true })
      
      // Google 인증 파일 생성
      if (validatedData.googleFileMethod && validatedData.googleFileName && validatedData.googleFileContent) {
        await writeFile(
          path.join(publicPath, validatedData.googleFileName),
          validatedData.googleFileContent
        )
      }
      
      // Naver 인증 파일 생성
      if (validatedData.naverFileMethod && validatedData.naverFileName && validatedData.naverFileContent) {
        await writeFile(
          path.join(publicPath, validatedData.naverFileName),
          validatedData.naverFileContent
        )
      }
    } catch (fileError) {
      logger.warn('Verification file creation failed', {
        requestId,
        error: fileError instanceof Error ? fileError.message : 'Unknown error'
      })
      // 파일 생성 실패해도 메타태그 설정은 저장
    }

    // 기존 설정 찾기 또는 생성
    let verification = await prisma.searchEngineVerification.findFirst({
      where: { updatedBy: user.id }
    })
    
    if (verification) {
      // 기존 설정 업데이트
      verification = await prisma.searchEngineVerification.update({
        where: { id: verification.id },
        data: {
          googleVerification: validatedData.googleVerification,
          naverVerification: validatedData.naverVerification,
          bingVerification: validatedData.bingVerification,
          googleFileMethod: validatedData.googleFileMethod,
          naverFileMethod: validatedData.naverFileMethod,
          googleFileName: validatedData.googleFileName,
          googleFileContent: validatedData.googleFileContent,
          naverFileName: validatedData.naverFileName,
          naverFileContent: validatedData.naverFileContent,
        }
      })
    } else {
      // 새 설정 생성
      verification = await prisma.searchEngineVerification.create({
        data: {
          googleVerification: validatedData.googleVerification,
          naverVerification: validatedData.naverVerification,
          bingVerification: validatedData.bingVerification,
          googleFileMethod: validatedData.googleFileMethod,
          naverFileMethod: validatedData.naverFileMethod,
          googleFileName: validatedData.googleFileName,
          googleFileContent: validatedData.googleFileContent,
          naverFileName: validatedData.naverFileName,
          naverFileContent: validatedData.naverFileContent,
          updatedBy: user.id
        }
      })
    }

    const duration = Date.now() - startTime
    
    logger.info('Search engine verification update completed', {
      requestId,
      userId: user.id,
      googleEnabled: !!validatedData.googleVerification,
      naverEnabled: !!validatedData.naverVerification,
      bingEnabled: !!validatedData.bingVerification,
      googleFileMethod: validatedData.googleFileMethod,
      naverFileMethod: validatedData.naverFileMethod,
      duration
    })
    
    metrics.recordApiCall('search_engine_verification', 'POST', 'success', duration)

    return NextResponse.json({
      success: true,
      message: '검색엔진 인증 설정이 성공적으로 저장되었습니다'
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (error instanceof z.ZodError) {
      logger.warn('Search engine verification validation failed', {
        requestId,
        errors: error.errors,
        duration
      })
      
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      )
    }

    logger.error('Search engine verification update failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    })
    
    metrics.recordApiCall('search_engine_verification', 'POST', 'error', duration)
    
    return NextResponse.json(
      { success: false, error: '검색엔진 인증 설정 저장 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}