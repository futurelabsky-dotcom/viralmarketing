'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Carousel } from '@/components/ui/carousel'
import { ArrowRight, BookOpen } from 'lucide-react'
import { useSession } from '@/lib/auth-context'

interface Banner {
  id: string
  title: string
  subtitle?: string
  description?: string
  imageUrl?: string
  linkUrl?: string
  buttonText?: string
  isActive: boolean
  order: number
}

interface HeroBannerProps {
  fallbackContent?: React.ReactNode
}

export function HeroBanner({ fallbackContent }: HeroBannerProps) {
  const { data: session } = useSession()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banners?active=true')
      const data = await response.json()
      
      if (data.success && data.banners) {
        setBanners(data.banners)
      }
    } catch (error) {
      console.error('배너 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const DefaultContent = () => (
    <section className="text-center py-12 px-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        마케팅 커뮤니티에 오신 것을 환영합니다
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        마케터와 사업자를 위한 종합 플랫폼에서 지식을 공유하고 네트워킹하세요
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {session ? (
          <Button size="lg" asChild>
            <Link href="/community/write">
              <BookOpen className="mr-2 h-5 w-5" />
              게시글 작성하기
            </Link>
          </Button>
        ) : (
          <Button size="lg" asChild>
            <Link href="/auth/signup">
              회원가입하고 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        )}
        <Button size="lg" variant="outline" asChild>
          <Link href="/community">커뮤니티 둘러보기</Link>
        </Button>
      </div>
    </section>
  )

  const BannerSlide = ({ banner }: { banner: Banner }) => (
    <div className="relative min-h-[400px] flex items-center justify-center overflow-hidden rounded-2xl">
      {banner.imageUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}
      
      <div 
        className={`relative z-10 text-center px-6 py-12 ${
          banner.imageUrl 
            ? 'text-white' 
            : 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent'
        }`}
      >
        {banner.subtitle && (
          <p className={`text-lg mb-2 ${banner.imageUrl ? 'text-white/90' : 'text-muted-foreground'}`}>
            {banner.subtitle}
          </p>
        )}
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {banner.title}
        </h1>
        
        {banner.description && (
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${
            banner.imageUrl ? 'text-white/90' : 'text-muted-foreground'
          }`}>
            {banner.description}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {banner.linkUrl && banner.buttonText && (
            <Button size="lg" asChild variant={banner.imageUrl ? "default" : "default"}>
              <Link href={banner.linkUrl}>
                {banner.buttonText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
          
          {/* 기본 액션 버튼들 */}
          {!banner.linkUrl && (
            <>
              {session ? (
                <Button size="lg" asChild variant={banner.imageUrl ? "default" : "default"}>
                  <Link href="/community/write">
                    <BookOpen className="mr-2 h-5 w-5" />
                    게시글 작성하기
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild variant={banner.imageUrl ? "default" : "default"}>
                  <Link href="/auth/signup">
                    회원가입하고 시작하기
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
              <Button 
                size="lg" 
                variant={banner.imageUrl ? "outline" : "outline"} 
                asChild
                className={banner.imageUrl ? "border-white text-white hover:bg-white hover:text-black" : ""}
              >
                <Link href="/community">커뮤니티 둘러보기</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <section className="animate-pulse">
        <div className="bg-gray-200 rounded-2xl h-96"></div>
      </section>
    )
  }

  if (banners.length === 0) {
    return fallbackContent || <DefaultContent />
  }

  if (banners.length === 1) {
    return <BannerSlide banner={banners[0]} />
  }

  return (
    <Carousel
      autoPlay={true}
      autoPlayInterval={6000}
      showControls={true}
      showIndicators={true}
      className="rounded-2xl"
    >
      {banners.map((banner) => (
        <BannerSlide key={banner.id} banner={banner} />
      ))}
    </Carousel>
  )
}

export default HeroBanner