'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from '@/lib/auth-context'
import { TrendingUp, Users, BookOpen, Calendar, ArrowRight, MessageSquare, Heart, Eye, Hash, Flame } from 'lucide-react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import Sidebar from '@/components/layout/sidebar'
import HeroBanner from '@/components/hero-banner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, getInitials } from '@/lib/utils'

export default function HomePage() {
  const { data: session } = useSession()
  const [featuredPosts, setFeaturedPosts] = useState<any[]>([])
  const [popularPosts, setPopularPosts] = useState<any[]>([])
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [newsArticles, setNewsArticles] = useState<any[]>([])

  // 실제 API에서 데이터 가져오기
  useEffect(() => {
    fetchFeaturedPosts()
    fetchPopularPosts()
    fetchRecentPosts()
    fetchTrendingKeywords()
    
    // Upcoming events (더미 데이터 유지)
    setUpcomingEvents([
      {
        id: 1,
        title: '마케팅 자동화 실무 웨비나',
        type: 'webinar',
        startDate: new Date('2024-03-15'),
        participants: 156,
        maxParticipants: 200,
      },
      {
        id: 2,
        title: 'SEO 최적화 심화 워크샵',
        type: 'workshop',
        startDate: new Date('2024-03-18'),
        participants: 45,
        maxParticipants: 50,
      },
    ])

    // News articles
    setNewsArticles([
      {
        id: 1,
        title: '구글, 새로운 광고 정책 발표',
        excerpt: '구글이 2024년 하반기부터 적용될 새로운 광고 정책을 발표했습니다.',
        publishedAt: new Date('2024-03-12'),
        source: '마케팅 뉴스',
      },
      {
        id: 2,
        title: '메타, 인스타그램 쇼핑 기능 대폭 개선',
        excerpt: '인스타그램의 쇼핑 기능이 대폭 개선되어 이커머스 마케터들의 관심을 끌고 있습니다.',
        publishedAt: new Date('2024-03-11'),
        source: '소셜미디어 인사이트',
      },
    ])
  }, [])

  const fetchFeaturedPosts = async () => {
    try {
      const response = await fetch('/api/posts?page=1&limit=2&sort=popular&category=&search=')
      const data = await response.json()
      
      if (data.success && data.data.posts) {
        const transformedPosts = data.data.posts.map((post: any) => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || post.content.substring(0, 200) + '...',
          author: {
            name: post.author.nickname || post.author.name,
            image: post.author.image
          },
          category: post.category.name,
          createdAt: new Date(post.createdAt),
          viewCount: post.viewCount || 0,
          likeCount: post._count?.likes || 0,
          commentCount: post._count?.comments || 0,
          tags: post.tags ? post.tags.split(',').filter(Boolean) : []
        }))
        setFeaturedPosts(transformedPosts)
      }
    } catch (error) {
      console.error('Featured posts fetch failed:', error)
      // 에러 시 빈 배열
      setFeaturedPosts([])
    }
  }

  const fetchPopularPosts = async () => {
    try {
      const response = await fetch('/api/posts?page=1&limit=4&sort=likes&category=&search=')
      const data = await response.json()
      
      if (data.success && data.data.posts) {
        const transformedPosts = data.data.posts.map((post: any) => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || post.content.substring(0, 100) + '...',
          author: {
            name: post.author.nickname || post.author.name,
            image: post.author.image
          },
          category: post.category.name,
          createdAt: new Date(post.createdAt),
          viewCount: post.viewCount || 0,
          likeCount: post._count?.likes || 0,
          commentCount: post._count?.comments || 0
        }))
        setPopularPosts(transformedPosts)
      }
    } catch (error) {
      console.error('Popular posts fetch failed:', error)
      setPopularPosts([])
    }
  }

  const fetchRecentPosts = async () => {
    try {
      const response = await fetch('/api/posts?page=1&limit=3&sort=latest&category=&search=')
      const data = await response.json()
      
      if (data.success && data.data.posts) {
        const transformedPosts = data.data.posts.map((post: any) => ({
          id: post.id,
          title: post.title,
          author: {
            name: post.author.nickname || post.author.name,
            image: post.author.image
          },
          category: post.category.name,
          createdAt: new Date(post.createdAt),
          viewCount: post.viewCount || 0,
          likeCount: post._count?.likes || 0,
          commentCount: post._count?.comments || 0
        }))
        setRecentPosts(transformedPosts)
      }
    } catch (error) {
      console.error('Recent posts fetch failed:', error)
      // 에러 시 빈 배열
      setRecentPosts([])
    }
  }

  const fetchTrendingKeywords = async () => {
    try {
      const response = await fetch('/api/trending-keywords')
      const data = await response.json()
      
      if (data.success && data.keywords) {
        setTrendingKeywords(data.keywords)
      }
    } catch (error) {
      console.error('Trending keywords fetch failed:', error)
      setTrendingKeywords([])
    }
  }

  const stats = [
    { label: '총 회원수', value: '12,547', icon: Users, change: '+12%' },
    { label: '오늘 게시글', value: '148', icon: BookOpen, change: '+8%' },
    { label: '이번주 행사', value: '7', icon: Calendar, change: '+2%' },
    { label: '월간 조회수', value: '2.3M', icon: TrendingUp, change: '+15%' },
  ]

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 space-y-8">
              {/* Hero Banner */}
              <HeroBanner />

              {/* Stats */}
              <section>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {stats.map((stat) => (
                    <Card key={stat.label}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                          </div>
                          <stat.icon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="mt-2">
                          <span className="text-sm font-medium text-green-600">
                            {stat.change}
                          </span>
                          <span className="text-sm text-muted-foreground ml-1">
                            이번 달
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Featured Posts */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">추천 게시글</h2>
                  <Button variant="outline" asChild>
                    <Link href="/community">
                      더 보기
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <Badge variant="secondary">{post.category}</Badge>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(post.createdAt)}
                          </div>
                        </div>
                        <h3 className="font-bold text-xl mb-3 hover:text-primary">
                          <Link href={`/posts/${post.id}`}>
                            {post.title}
                          </Link>
                        </h3>
                        <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={post.author.image || undefined} alt={post.author.name} />
                              <AvatarFallback className="text-xs">
                                {getInitials(post.author.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{post.author.name}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Eye className="mr-1 h-4 w-4" />
                              {post.viewCount}
                            </div>
                            <div className="flex items-center">
                              <Heart className="mr-1 h-4 w-4" />
                              {post.likeCount}
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="mr-1 h-4 w-4" />
                              {post.commentCount}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {post.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Popular Posts */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center">
                    <Flame className="mr-2 h-6 w-6 text-orange-500" />
                    인기 게시물
                  </h2>
                  <Button variant="outline" asChild>
                    <Link href="/community?sort=likes">
                      더 보기
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {popularPosts.map((post, index) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow relative">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant={index === 0 ? "default" : "secondary"} 
                            className={index === 0 ? "bg-orange-500" : ""}
                          >
                            #{index + 1}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-sm mb-2 line-clamp-2 hover:text-primary">
                          <Link href={`/posts/${post.id}`}>
                            {post.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span className="flex items-center">
                            <Avatar className="h-4 w-4 mr-1">
                              <AvatarImage src={post.author.image || undefined} alt={post.author.name} />
                              <AvatarFallback className="text-[8px]">
                                {getInitials(post.author.name)}
                              </AvatarFallback>
                            </Avatar>
                            {post.author.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <span className="flex items-center">
                              <Heart className="mr-1 h-3 w-3 text-red-500" />
                              {post.likeCount}
                            </span>
                            <span className="flex items-center">
                              <Eye className="mr-1 h-3 w-3" />
                              {post.viewCount}
                            </span>
                          </div>
                          <span className="text-xs">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Trending Keywords */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center">
                    <Hash className="mr-2 h-6 w-6 text-blue-500" />
                    실시간 트렌딩 키워드
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    지난 7일 기준
                  </div>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-3">
                      {trendingKeywords.map((keyword, index) => (
                        <Link 
                          key={keyword} 
                          href={`/community?search=${encodeURIComponent(keyword)}`}
                          className="group"
                        >
                          <Badge 
                            variant={index < 3 ? "default" : "secondary"}
                            className={`
                              cursor-pointer transition-all hover:scale-105 
                              ${index === 0 ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 
                                index === 1 ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white' : 
                                index === 2 ? 'bg-gradient-to-r from-yellow-500 to-green-500 text-white' : 
                                'hover:bg-primary hover:text-primary-foreground'}
                            `}
                          >
                            <TrendingUp className="mr-1 h-3 w-3" />
                            #{keyword}
                            <span className="ml-1 text-xs opacity-75">
                              {index + 1}
                            </span>
                          </Badge>
                        </Link>
                      ))}
                    </div>
                    {trendingKeywords.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>트렌딩 키워드를 분석 중입니다...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              {/* Recent Posts & News */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Recent Posts */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">최근 게시글</h2>
                    <Button variant="ghost" asChild>
                      <Link href="/community">전체 보기</Link>
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <Card key={post.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="text-xs">
                              {post.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(post.createdAt)}
                            </span>
                          </div>
                          <h3 className="font-medium hover:text-primary mb-2">
                            <Link href={`/posts/${post.id}`}>
                              {post.title}
                            </Link>
                          </h3>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{post.author.name}</span>
                            <div className="flex items-center space-x-3">
                              <span>조회 {post.viewCount}</span>
                              <span>댓글 {post.commentCount}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>

                {/* News & Events */}
                <section className="space-y-8">
                  {/* Latest News */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">마케팅 뉴스</h2>
                      <Button variant="ghost" asChild>
                        <Link href="/news">전체 보기</Link>
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {newsArticles.map((article) => (
                        <Card key={article.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs text-muted-foreground">
                                {article.source}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(article.publishedAt)}
                              </span>
                            </div>
                            <h3 className="font-medium hover:text-primary mb-2">
                              <Link href={`/news/${article.id}`}>
                                {article.title}
                              </Link>
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {article.excerpt}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Events */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">예정된 행사</h2>
                      <Button variant="ghost" asChild>
                        <Link href="/events">전체 보기</Link>
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {upcomingEvents.map((event) => (
                        <Card key={event.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="default" className="text-xs">
                                {event.type === 'webinar' ? '웨비나' : '워크샵'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(event.startDate)}
                              </span>
                            </div>
                            <h3 className="font-medium hover:text-primary mb-2">
                              <Link href={`/events/${event.id}`}>
                                {event.title}
                              </Link>
                            </h3>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                참가자 {event.participants}/{event.maxParticipants}명
                              </span>
                              <Button size="sm" variant="outline">
                                신청하기
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Sidebar */}
            <Sidebar />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}