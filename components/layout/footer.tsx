export default function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div>
              <span className="text-2xl font-bold text-white">마케팅 커뮤니티</span>
            </div>
            <p className="text-base text-gray-300">
              마케터들이 모이는 곳, 함께 성장하는 커뮤니티입니다.
            </p>
            <div className="flex space-x-6">
              {/* 소셜 미디어 링크들 */}
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-base font-medium text-white">커뮤니티</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <a href="/community" className="text-base text-gray-300 hover:text-white">
                      자유게시판
                    </a>
                  </li>
                  <li>
                    <a href="/qna" className="text-base text-gray-300 hover:text-white">
                      Q&A
                    </a>
                  </li>
                  <li>
                    <a href="/resources" className="text-base text-gray-300 hover:text-white">
                      자료실
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-base font-medium text-white">정보</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <a href="/events" className="text-base text-gray-300 hover:text-white">
                      이벤트
                    </a>
                  </li>
                  <li>
                    <a href="/news" className="text-base text-gray-300 hover:text-white">
                      뉴스
                    </a>
                  </li>
                  <li>
                    <a href="/faq" className="text-base text-gray-300 hover:text-white">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-base font-medium text-white">고객지원</h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <a href="/contact" className="text-base text-gray-300 hover:text-white">
                      문의하기
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="text-base text-gray-300 hover:text-white">
                      이용약관
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; 2024 마케팅 커뮤니티. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}