import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyJWT } from '@/lib/auth-jwt'
import { logger } from '@/lib/logging'
import { metrics } from '@/lib/metrics'
import { writeFile } from 'fs/promises'
import path from 'path'

// 사이트맵 생성
export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  try {
    logger.info('Sitemap generation started', { requestId })
    
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

    // 사이트 URL 가져오기
    const siteUrlConfig = await prisma.siteConfig.findUnique({
      where: { key: 'seo.siteUrl' }
    })
    
    const baseUrl = siteUrlConfig?.value || 'https://yourdomain.com'

    // 모든 게시글, Q&A, 카테고리 가져오기
    const [posts, questions, categories] = await Promise.all([
      prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.question.findMany({
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, createdAt: true }
      })
    ])

    // 사이트맵 XML 생성
    const generateSitemapXml = () => {
      const now = new Date().toISOString()
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${now}</lastmod>
  </url>
  
  <!-- Static pages -->
  <url>
    <loc>${baseUrl}/community</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>${now}</lastmod>
  </url>
  
  <url>
    <loc>${baseUrl}/qna</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>${now}</lastmod>
  </url>
  
  <url>
    <loc>${baseUrl}/resources</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${now}</lastmod>
  </url>
  
  <url>
    <loc>${baseUrl}/auth/signin</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
    <lastmod>${now}</lastmod>
  </url>
  
  <url>
    <loc>${baseUrl}/auth/signup</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
    <lastmod>${now}</lastmod>
  </url>`

      // 카테고리 페이지
      categories.forEach(category => {
        xml += `
  <url>
    <loc>${baseUrl}/community?category=${category.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    <lastmod>${category.createdAt.toISOString()}</lastmod>
  </url>`
      })

      // 게시글 페이지
      posts.forEach(post => {
        xml += `
  <url>
    <loc>${baseUrl}/posts/${post.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
  </url>`
      })

      // Q&A 페이지
      questions.forEach(question => {
        xml += `
  <url>
    <loc>${baseUrl}/qna/${question.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
    <lastmod>${question.updatedAt.toISOString()}</lastmod>
  </url>`
      })

      xml += `
</urlset>`

      return xml
    }

    // robots.txt 생성
    const generateRobotsTxt = async () => {
      const robotsConfig = await prisma.siteConfig.findUnique({
        where: { key: 'seo.robotsTxt' }
      })

      return robotsConfig?.value || `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`
    }

    const sitemapXml = generateSitemapXml()
    const robotsTxt = await generateRobotsTxt()

    // public 폴더에 파일 저장
    const publicPath = path.join(process.cwd(), 'public')
    
    try {
      await Promise.all([
        writeFile(path.join(publicPath, 'sitemap.xml'), sitemapXml),
        writeFile(path.join(publicPath, 'robots.txt'), robotsTxt)
      ])
    } catch (fileError) {
      logger.error('File write error during sitemap generation', {
        requestId,
        error: fileError instanceof Error ? fileError.message : 'Unknown error'
      })
      
      return NextResponse.json(
        { success: false, error: '파일 저장 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    const duration = Date.now() - startTime
    
    logger.info('Sitemap generation completed', {
      requestId,
      userId: user.id,
      postsCount: posts.length,
      questionsCount: questions.length,
      categoriesCount: categories.length,
      duration
    })
    
    metrics.recordApiCall('generate_sitemap', 'POST', 'success', duration)

    return NextResponse.json({
      success: true,
      message: '사이트맵과 robots.txt가 성공적으로 생성되었습니다',
      stats: {
        postsCount: posts.length,
        questionsCount: questions.length,
        categoriesCount: categories.length,
        totalUrls: posts.length + questions.length + categories.length + 6 // static pages
      }
    })
  } catch (error) {
    const duration = Date.now() - startTime
    
    logger.error('Sitemap generation failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    })
    
    metrics.recordApiCall('generate_sitemap', 'POST', 'error', duration)
    
    return NextResponse.json(
      { success: false, error: '사이트맵 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}