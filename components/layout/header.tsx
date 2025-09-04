'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // 로그인 상태 확인 및 세션 복원
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user')
        const token = localStorage.getItem('token')
        if (userData && token) {
          try {
            const user = JSON.parse(userData)
            // 토큰 유효성 간단 체크 (데모용)
            if (token && token.length > 10) {
              setUser(user)
              console.log('세션 복원됨:', user.name)
            } else {
              // 유효하지 않은 토큰인 경우 세션 클리어
              localStorage.removeItem('user')
              localStorage.removeItem('token')
              setUser(null)
            }
          } catch (e) {
            // JSON 파싱 오류시 세션 클리어
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            setUser(null)
          }
        } else {
          setUser(null)
        }
      }
    }
    
    checkAuth()
    
    // 로그인/로그아웃 시 상태 업데이트를 위한 이벤트 리스너
    window.addEventListener('storage', checkAuth)
    
    // 페이지 포커스 시 세션 재확인 (다른 탭에서 로그아웃했을 경우)
    window.addEventListener('focus', checkAuth)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('focus', checkAuth)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/'
  }

  const navigation = [
    { name: '홈', href: '/' },
    { name: '커뮤니티', href: '/community' },
    { name: 'Q&A', href: '/qna' },
    { name: '자료실', href: '/resources' },
    { name: '이벤트', href: '/events' },
    { name: '뉴스', href: '/news' },
  ]

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-indigo-500 py-6 lg:border-none">
          <div className="flex items-center">
            <Link href="/">
              <span className="text-2xl font-bold text-indigo-600">마케팅 커뮤니티</span>
            </Link>
            <div className="ml-10 hidden space-x-8 lg:block">
              {navigation.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-base font-medium text-gray-700 hover:text-indigo-600"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="ml-10 space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-base font-medium text-gray-700">
                  안녕하세요, {user.name}님
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-block rounded-md border border-transparent bg-red-500 py-2 px-4 text-base font-medium text-white hover:bg-opacity-75"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="inline-block rounded-md border border-transparent bg-indigo-500 py-2 px-4 text-base font-medium text-white hover:bg-opacity-75"
              >
                로그인
              </Link>
            )}
          </div>
          <div className="lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}