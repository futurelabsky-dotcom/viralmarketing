'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-context'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save, X, AlertCircle, FileText } from 'lucide-react'

interface Template {
  id: string
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  fileUrl?: string
  isPublic: boolean
  author: {
    id: string
    name: string
    nickname: string
    image?: string
  }
}

export default function EditTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [template, setTemplate] = useState<Template | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    tags: [] as string[],
    tagInput: '',
    fileUrl: '',
    isPublic: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const categories = [
    { id: 'planning', name: '기획서' },
    { id: 'design', name: '디자인' },
    { id: 'report', name: '분석보고서' },
    { id: 'presentation', name: '프레젠테이션' },
    { id: 'etc', name: '기타' },
  ]

  useEffect(() => {
    if (params.id) {
      fetchTemplate()
    }
  }, [params.id])

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/templates/${params.id}`, {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        const templateData = data.template
        
        // 권한 확인 - 작성자 또는 관리자만
        if (session?.user?.id !== templateData.author.id && !session?.user?.isAdmin) {
          alert('수정 권한이 없습니다.')
          router.push(`/resources/${params.id}`)
          return
        }

        setTemplate(templateData)
        setFormData({
          title: templateData.title,
          description: templateData.description || '',
          content: templateData.content,
          category: templateData.category,
          tags: templateData.tags ? templateData.tags.split(',').filter(Boolean) : [],
          tagInput: '',
          fileUrl: templateData.fileUrl || '',
          isPublic: templateData.isPublic
        })
      } else {
        console.error('템플릿 로딩 실패:', data.error)
        alert('템플릿을 불러오는데 실패했습니다.')
        router.push('/resources')
      }
    } catch (error) {
      console.error('템플릿 로딩 오류:', error)
      alert('템플릿을 불러오는 중 오류가 발생했습니다.')
      router.push('/resources')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddTag = () => {
    const tag = formData.tagInput.trim()
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: ''
      }))
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요'
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요'
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/templates/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          category: formData.category,
          tags: formData.tags,
          fileUrl: formData.fileUrl || undefined,
          isPublic: formData.isPublic
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('자료가 수정되었습니다.')
        router.push(`/resources/${params.id}`)
      } else {
        setErrors({ submit: data.error || '자료 수정에 실패했습니다' })
      }
    } catch (error) {
      console.error('수정 오류:', error)
      setErrors({ submit: '자료 수정 중 오류가 발생했습니다' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="text-center">로딩 중...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">템플릿을 찾을 수 없습니다</h1>
            <Button asChild>
              <Link href="/resources">
                <ArrowLeft className="h-4 w-4 mr-2" />
                자료실로 돌아가기
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/resources/${params.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                상세페이지로 돌아가기
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">자료 수정</h1>
          </div>
          <p className="text-gray-600">
            자료의 정보를 수정하세요
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>자료 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 제목 */}
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="자료의 제목을 입력해주세요"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              {/* 간단한 설명 */}
              <div className="space-y-2">
                <Label htmlFor="description">간단한 설명</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="자료에 대한 간단한 설명을 입력해주세요"
                />
              </div>

              {/* 카테고리 */}
              <div className="space-y-2">
                <Label htmlFor="category">카테고리 *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="카테고리를 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              {/* 파일 URL */}
              <div className="space-y-2">
                <Label htmlFor="fileUrl">파일 다운로드 URL</Label>
                <Input
                  id="fileUrl"
                  value={formData.fileUrl}
                  onChange={(e) => handleInputChange('fileUrl', e.target.value)}
                  placeholder="다운로드 가능한 파일 URL을 입력해주세요 (선택사항)"
                />
                <p className="text-sm text-gray-500">
                  Google Drive, Dropbox 등의 공유 링크를 입력하실 수 있습니다
                </p>
              </div>

              {/* 태그 */}
              <div className="space-y-2">
                <Label htmlFor="tags">태그 (최대 5개)</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={formData.tagInput}
                    onChange={(e) => handleInputChange('tagInput', e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="태그를 입력하고 Enter를 누르세요"
                    disabled={formData.tags.length >= 5}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    size="sm"
                    disabled={!formData.tagInput.trim() || formData.tags.length >= 5}
                  >
                    추가
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="px-2 py-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* 내용 */}
              <div className="space-y-2">
                <Label htmlFor="content">상세 내용 *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="자료에 대한 상세한 설명을 입력해주세요"
                  rows={10}
                  className={errors.content ? 'border-red-500' : ''}
                />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content}</p>
                )}
              </div>

              {/* 공개 설정 */}
              <div className="space-y-2">
                <Label>공개 설정</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isPublic" className="text-sm font-normal">
                    모든 사용자에게 공개
                  </Label>
                </div>
              </div>

              {/* 오류 메시지 */}
              {errors.submit && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}

              {/* 버튼 */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/resources/${params.id}`)}
                  disabled={saving}
                >
                  취소
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>수정 중...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      자료 수정
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}