import { prisma } from './db'
import { logger } from './logging'
import { pointPolicies } from './point-policies'
import { NotificationService, NotificationTemplates } from './notifications'

export interface PointTransaction {
  userId: string
  amount: number
  action: string
  description: string
  metadata?: Record<string, any>
}

export class PointsService {
  static async deductPoints(transaction: PointTransaction): Promise<boolean> {
    try {
      // 현재 포인트 확인
      const user = await prisma.user.findUnique({
        where: { id: transaction.userId },
        select: { points: true }
      })

      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.')
      }

      const currentPoints = user.points
      const deductAmount = Math.abs(transaction.amount)

      if (currentPoints < deductAmount) {
        logger.warn('Insufficient points', {
          userId: transaction.userId,
          currentPoints,
          requiredPoints: deductAmount,
          action: transaction.action
        })
        return false
      }

      // 포인트 차감 및 활동 기록
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: transaction.userId },
          data: { points: currentPoints - deductAmount }
        })

        await tx.activity.create({
          data: {
            type: transaction.action,
            title: transaction.description,
            description: `${deductAmount}포인트가 차감되었습니다.`,
            points: -deductAmount,
            metadata: transaction.metadata ? JSON.stringify(transaction.metadata) : null,
            userId: transaction.userId
          }
        })
      })

      logger.info('Points deducted successfully', {
        userId: transaction.userId,
        amount: deductAmount,
        action: transaction.action,
        remainingPoints: currentPoints - deductAmount
      })

      return true
    } catch (error) {
      logger.error('Failed to deduct points', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transaction
      })
      throw error
    }
  }

  static async awardPoints(transaction: PointTransaction): Promise<void> {
    try {
      const awardAmount = Math.abs(transaction.amount)

      // 포인트 지급 및 활동 기록
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: transaction.userId },
          data: { points: { increment: awardAmount } }
        })

        await tx.activity.create({
          data: {
            type: transaction.action,
            title: transaction.description,
            description: `${awardAmount}포인트를 획득했습니다.`,
            points: awardAmount,
            metadata: transaction.metadata ? JSON.stringify(transaction.metadata) : null,
            userId: transaction.userId
          }
        })
      })

      // 포인트 획득 알림
      await NotificationService.create({
        type: NotificationTemplates.POINTS_EARNED.type,
        title: NotificationTemplates.POINTS_EARNED.title,
        message: NotificationTemplates.POINTS_EARNED.getMessage(awardAmount, transaction.description),
        userId: transaction.userId,
        metadata: { points: awardAmount, action: transaction.action }
      })

      logger.info('Points awarded successfully', {
        userId: transaction.userId,
        amount: awardAmount,
        action: transaction.action
      })
    } catch (error) {
      logger.error('Failed to award points', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transaction
      })
      throw error
    }
  }

  static async processAction(userId: string, action: string, metadata?: Record<string, any>): Promise<boolean> {
    try {
      const policy = pointPolicies.getPolicy(action)
      if (!policy) {
        logger.warn('Unknown point policy action', { action, userId })
        return true // 정책이 없으면 계속 진행
      }

      const pointCost = policy.pointCost
      
      if (pointCost > 0) {
        // 포인트 차감
        const success = await this.deductPoints({
          userId,
          amount: pointCost,
          action,
          description: policy.actionName,
          metadata
        })
        return success
      } else if (pointCost < 0) {
        // 포인트 지급
        await this.awardPoints({
          userId,
          amount: Math.abs(pointCost),
          action,
          description: policy.actionName,
          metadata
        })
      }

      return true
    } catch (error) {
      logger.error('Failed to process point action', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        action,
        metadata
      })
      return false
    }
  }

  static async getPointHistory(userId: string, options: {
    page?: number
    limit?: number
    type?: string
  } = {}) {
    const { page = 1, limit = 20, type } = options
    const skip = (page - 1) * limit

    try {
      const where = {
        userId,
        ...(type && { type })
      }

      const [activities, totalCount] = await Promise.all([
        prisma.activity.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.activity.count({ where })
      ])

      return {
        activities,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: page < Math.ceil(totalCount / limit)
        }
      }
    } catch (error) {
      logger.error('Failed to get point history', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        options
      })
      throw error
    }
  }

  static async getUserPoints(userId: string): Promise<number> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true }
      })

      return user?.points || 0
    } catch (error) {
      logger.error('Failed to get user points', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      })
      return 0
    }
  }

  static async getLeaderboard(limit: number = 10) {
    try {
      const users = await prisma.user.findMany({
        where: {
          isActive: true,
          points: { gt: 0 }
        },
        select: {
          id: true,
          name: true,
          nickname: true,
          image: true,
          points: true,
          company: true,
          position: true,
          _count: {
            select: {
              posts: true,
              comments: true
            }
          }
        },
        orderBy: { points: 'desc' },
        take: limit
      })

      return users.map((user, index) => ({
        rank: index + 1,
        ...user,
        stats: {
          posts: user._count.posts,
          comments: user._count.comments,
          totalActivity: user._count.posts + user._count.comments
        }
      }))
    } catch (error) {
      logger.error('Failed to get leaderboard', {
        error: error instanceof Error ? error.message : 'Unknown error',
        limit
      })
      return []
    }
  }

  // 관리자 기능: 포인트 직접 지급/차감
  static async adminAdjustPoints(
    adminId: string,
    targetUserId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    try {
      // 관리자 권한 확인
      const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { isAdmin: true }
      })

      if (!admin?.isAdmin) {
        throw new Error('관리자 권한이 필요합니다.')
      }

      const transaction: PointTransaction = {
        userId: targetUserId,
        amount: Math.abs(amount),
        action: amount > 0 ? 'admin_award' : 'admin_deduct',
        description: `관리자 조정: ${reason}`,
        metadata: { adminId, reason }
      }

      if (amount > 0) {
        await this.awardPoints(transaction)
      } else {
        await this.deductPoints(transaction)
      }

      logger.info('Admin point adjustment completed', {
        adminId,
        targetUserId,
        amount,
        reason
      })
    } catch (error) {
      logger.error('Failed to adjust points by admin', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminId,
        targetUserId,
        amount,
        reason
      })
      throw error
    }
  }
}