import { prisma } from '@/lib/db'

export interface PermissionData {
  name: string
  displayName: string
  description?: string
  category: string
}

export interface RoleData {
  name: string
  displayName: string
  description?: string
  isDefault?: boolean
}

export class PermissionsService {
  // 기본 권한 정의
  static readonly DEFAULT_PERMISSIONS: PermissionData[] = [
    // 게시글 관련
    { name: 'posts:read', displayName: '게시글 읽기', category: 'posts' },
    { name: 'posts:create', displayName: '게시글 작성', category: 'posts' },
    { name: 'posts:edit', displayName: '게시글 수정', category: 'posts' },
    { name: 'posts:delete', displayName: '게시글 삭제', category: 'posts' },
    { name: 'posts:moderate', displayName: '게시글 관리', description: '다른 사용자 게시글 수정/삭제', category: 'posts' },
    
    // 댓글 관련
    { name: 'comments:create', displayName: '댓글 작성', category: 'comments' },
    { name: 'comments:edit', displayName: '댓글 수정', category: 'comments' },
    { name: 'comments:delete', displayName: '댓글 삭제', category: 'comments' },
    { name: 'comments:moderate', displayName: '댓글 관리', category: 'comments' },
    
    // Q&A 관련
    { name: 'questions:create', displayName: '질문 작성', category: 'questions' },
    { name: 'answers:create', displayName: '답변 작성', category: 'answers' },
    { name: 'questions:moderate', displayName: '질문/답변 관리', category: 'questions' },
    
    // 템플릿 관련
    { name: 'templates:create', displayName: '템플릿 업로드', category: 'templates' },
    { name: 'templates:moderate', displayName: '템플릿 관리', category: 'templates' },
    
    // 이벤트 관련
    { name: 'events:create', displayName: '행사 등록', category: 'events' },
    { name: 'events:moderate', displayName: '행사 관리', category: 'events' },
    
    // 사용자 관리
    { name: 'users:view', displayName: '사용자 조회', category: 'users' },
    { name: 'users:edit', displayName: '사용자 수정', category: 'users' },
    { name: 'users:suspend', displayName: '사용자 정지', category: 'users' },
    { name: 'users:delete', displayName: '사용자 삭제', category: 'users' },
    
    // 관리자 기능
    { name: 'admin:dashboard', displayName: '관리자 대시보드', category: 'admin' },
    { name: 'admin:analytics', displayName: '통계 및 분석', category: 'admin' },
    { name: 'admin:banners', displayName: '배너 관리', category: 'admin' },
    { name: 'admin:logo', displayName: '로고 관리', category: 'admin' },
    { name: 'admin:roles', displayName: '권한 관리', category: 'admin' },
    { name: 'admin:system', displayName: '시스템 설정', category: 'admin' },
    { name: 'admin:full', displayName: '전체 관리자', description: '모든 관리 권한', category: 'admin' },
  ]

  // 기본 역할 정의
  static readonly DEFAULT_ROLES: RoleData[] = [
    {
      name: 'user',
      displayName: '일반 사용자',
      description: '기본 사용자 권한',
      isDefault: true
    },
    {
      name: 'moderator',
      displayName: '모더레이터',
      description: '컨텐츠 관리 권한'
    },
    {
      name: 'admin',
      displayName: '관리자',
      description: '전체 시스템 관리 권한'
    }
  ]

  // 역할별 기본 권한 매핑
  static readonly DEFAULT_ROLE_PERMISSIONS = {
    user: [
      'posts:read', 'posts:create', 'posts:edit', 'posts:delete',
      'comments:create', 'comments:edit', 'comments:delete',
      'questions:create', 'answers:create',
      'templates:create',
      'events:create'
    ],
    moderator: [
      'posts:read', 'posts:create', 'posts:edit', 'posts:delete', 'posts:moderate',
      'comments:create', 'comments:edit', 'comments:delete', 'comments:moderate',
      'questions:create', 'answers:create', 'questions:moderate',
      'templates:create', 'templates:moderate',
      'events:create', 'events:moderate',
      'users:view', 'users:edit', 'users:suspend'
    ],
    admin: [
      'admin:full' // 전체 권한 포함
    ]
  }

  // 권한 초기화
  static async initializePermissions() {
    console.log('Initializing permissions and roles...')
    
    try {
      // 기본 권한 생성
      for (const permissionData of this.DEFAULT_PERMISSIONS) {
        await prisma.permission.upsert({
          where: { name: permissionData.name },
          update: {
            displayName: permissionData.displayName,
            description: permissionData.description,
            category: permissionData.category,
          },
          create: permissionData,
        })
      }

      // 기본 역할 생성
      for (const roleData of this.DEFAULT_ROLES) {
        await prisma.role.upsert({
          where: { name: roleData.name },
          update: {
            displayName: roleData.displayName,
            description: roleData.description,
            isDefault: roleData.isDefault,
          },
          create: roleData,
        })
      }

      // 역할-권한 연결
      for (const [roleName, permissions] of Object.entries(this.DEFAULT_ROLE_PERMISSIONS)) {
        const role = await prisma.role.findUnique({ where: { name: roleName } })
        if (!role) continue

        for (const permissionName of permissions) {
          const permission = await prisma.permission.findUnique({ where: { name: permissionName } })
          if (!permission) continue

          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id,
              }
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: permission.id,
            }
          })
        }
      }

      console.log('Permissions and roles initialized successfully')
    } catch (error) {
      console.error('Failed to initialize permissions:', error)
      throw error
    }
  }

  // 사용자 권한 확인
  static async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    try {
      // 관리자는 모든 권한 보유 (하위 호환성)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true }
      })

      if (user?.isAdmin) {
        return true
      }

      // 역할 기반 권한 확인
      const userRole = await prisma.userRole.findFirst({
        where: { userId },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      })

      if (!userRole) {
        // 기본 역할 권한 확인
        const defaultRole = await prisma.role.findFirst({
          where: { isDefault: true },
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        })

        return defaultRole?.rolePermissions.some(rp => 
          rp.permission.name === permissionName || rp.permission.name === 'admin:full'
        ) || false
      }

      return userRole.role.rolePermissions.some(rp => 
        rp.permission.name === permissionName || rp.permission.name === 'admin:full'
      )
    } catch (error) {
      console.error('Permission check failed:', error)
      return false
    }
  }

  // 사용자에게 역할 부여
  static async assignRole(userId: string, roleName: string, grantedBy?: string) {
    try {
      const role = await prisma.role.findUnique({ where: { name: roleName } })
      if (!role) {
        throw new Error(`Role ${roleName} not found`)
      }

      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId,
            roleId: role.id
          }
        },
        update: {
          grantedBy,
          grantedAt: new Date()
        },
        create: {
          userId,
          roleId: role.id,
          grantedBy
        }
      })
    } catch (error) {
      console.error('Failed to assign role:', error)
      throw error
    }
  }

  // 사용자의 역할과 권한 조회
  static async getUserPermissions(userId: string) {
    try {
      const userRoles = await prisma.userRole.findMany({
        where: { userId },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      })

      const permissions = new Set<string>()
      const roles = userRoles.map(ur => ur.role)

      for (const userRole of userRoles) {
        for (const rolePermission of userRole.role.rolePermissions) {
          permissions.add(rolePermission.permission.name)
        }
      }

      return {
        roles,
        permissions: Array.from(permissions)
      }
    } catch (error) {
      console.error('Failed to get user permissions:', error)
      return { roles: [], permissions: [] }
    }
  }
}

// 감사 로그 서비스
export class AuditService {
  static async log({
    action,
    resource,
    resourceType,
    oldValue,
    newValue,
    userId,
    ipAddress,
    userAgent,
    metadata
  }: {
    action: string
    resource?: string
    resourceType?: string
    oldValue?: any
    newValue?: any
    userId?: string
    ipAddress?: string
    userAgent?: string
    metadata?: any
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          action,
          resource,
          resourceType,
          oldValue: oldValue ? JSON.stringify(oldValue) : null,
          newValue: newValue ? JSON.stringify(newValue) : null,
          userId,
          ipAddress,
          userAgent,
          metadata: metadata ? JSON.stringify(metadata) : null,
        }
      })
    } catch (error) {
      console.error('Failed to log audit entry:', error)
      // 감사 로그 실패는 기본 동작을 방해하지 않음
    }
  }

  static async getAuditLogs({
    userId,
    action,
    resourceType,
    limit = 50,
    offset = 0
  }: {
    userId?: string
    action?: string
    resourceType?: string
    limit?: number
    offset?: number
  } = {}) {
    try {
      const where: any = {}
      
      if (userId) where.userId = userId
      if (action) where.action = { contains: action }
      if (resourceType) where.resourceType = resourceType

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                nickname: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.auditLog.count({ where })
      ])

      return { logs, total }
    } catch (error) {
      console.error('Failed to get audit logs:', error)
      return { logs: [], total: 0 }
    }
  }
}