'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface LogoData {
  siteName: string
  logoImageUrl?: string
  brandColor?: string
  description?: string
}

interface SiteLogoProps {
  showText?: boolean
  className?: string
  textClassName?: string
}

export function SiteLogo({ 
  showText = true, 
  className = "flex items-center space-x-2",
  textClassName = "hidden font-bold sm:inline-block"
}: SiteLogoProps) {
  const [logoData, setLogoData] = useState<LogoData>({
    siteName: '마케팅 커뮤니티',
    brandColor: '#0066cc'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogo()
  }, [])

  const fetchLogo = async () => {
    try {
      const response = await fetch('/api/logo')
      const data = await response.json()
      
      if (data.success && data.logo) {
        setLogoData(data.logo)
      }
    } catch (error) {
      console.error('로고 로딩 실패:', error)
      // 기본값 유지
    } finally {
      setLoading(false)
    }
  }

  const getInitial = (siteName: string) => {
    return siteName.charAt(0).toUpperCase()
  }

  const brandColor = logoData.brandColor || '#0066cc'

  if (loading) {
    return (
      <Link href="/" className={className}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 animate-pulse" />
        {showText && (
          <span className={`${textClassName} text-transparent bg-gray-200 rounded animate-pulse`}>
            Loading...
          </span>
        )}
      </Link>
    )
  }

  return (
    <Link href="/" className={className}>
      {logoData.logoImageUrl ? (
        <div className="relative h-8 w-8 flex-shrink-0">
          <Image
            src={logoData.logoImageUrl}
            alt={logoData.siteName}
            fill
            className="object-contain"
            priority
          />
        </div>
      ) : (
        <div 
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white font-bold text-lg flex-shrink-0"
          style={{ backgroundColor: brandColor }}
        >
          {getInitial(logoData.siteName)}
        </div>
      )}
      {showText && (
        <span className={textClassName}>
          {logoData.siteName}
        </span>
      )}
    </Link>
  )
}

export default SiteLogo