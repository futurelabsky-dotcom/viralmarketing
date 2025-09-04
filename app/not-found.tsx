import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="pt-16 pb-16">
              {/* 404 Icon */}
              <div className="mb-8">
                <div className="text-8xl font-bold text-indigo-600 mb-4">404</div>
                <div className="text-2xl font-semibold text-gray-900 mb-2">
                  페이지를 찾을 수 없습니다
                </div>
                <p className="text-gray-600 mb-8">
                  요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href="/">
                      <Home className="h-4 w-4 mr-2" />
                      홈페이지로 이동
                    </Link>
                  </Button>
                  
                  <Button variant="outline" size="lg" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    이전 페이지로
                  </Button>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  자주 찾는 페이지
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link
                    href="/community"
                    className="p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900">커뮤니티</div>
                    <div className="text-xs text-gray-500">게시글 보기</div>
                  </Link>
                  
                  <Link
                    href="/news"
                    className="p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900">뉴스</div>
                    <div className="text-xs text-gray-500">최신 소식</div>
                  </Link>
                  
                  <Link
                    href="/qna"
                    className="p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900">Q&A</div>
                    <div className="text-xs text-gray-500">질문과 답변</div>
                  </Link>
                  
                  <Link
                    href="/events"
                    className="p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900">이벤트</div>
                    <div className="text-xs text-gray-500">행사 정보</div>
                  </Link>
                </div>
              </div>

              {/* Search Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Search className="h-4 w-4" />
                  <span>찾으시는 내용이 있으시면 검색을 이용해보세요</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}