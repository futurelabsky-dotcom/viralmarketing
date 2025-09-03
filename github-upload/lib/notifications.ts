import { prisma } from './db'
import { logger } from './logging'

export interface NotificationData {
  type: string
  title: string
  message: string
  metadata?: Record<string, any>
  userId?: string
}

export interface NotificationOptions {
  priority?: 'low' | 'normal' | 'high'
  email?: boolean
  push?: boolean
}

export class NotificationService {
  static async create(data: NotificationData, options: NotificationOptions = {}) {
    try {
      const notification = await prisma.notification.create({
        data: {
          type: data.type,
          title: data.title,
          message: data.message,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          userId: data.userId!,
          isRead: false,
        }
      })

      logger.info('Notification created', {
        notificationId: notification.id,
        userId: data.userId,
        type: data.type,
        title: data.title
      })

      // 이메일 발송 (옵션)
      if (options.email) {
        await this.sendEmailNotification(notification)
      }

      // 푸시 알림 (옵션)
      if (options.push) {
        await this.sendPushNotification(notification)
      }

      return notification
    } catch (error) {
      logger.error('Failed to create notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data
      })
      throw error
    }
  }

  static async createForUsers(userIds: string[], data: Omit<NotificationData, 'userId'>, options: NotificationOptions = {}) {
    const notifications = await Promise.allSettled(
      userIds.map(userId => this.create({ ...data, userId }, options))
    )
    
    const successCount = notifications.filter(n => n.status === 'fulfilled').length
    const errorCount = notifications.filter(n => n.status === 'rejected').length
    
    logger.info('Bulk notification created', {
      total: userIds.length,
      success: successCount,
      errors: errorCount,
      type: data.type
    })

    return { successCount, errorCount }
  }

  static async markAsRead(userId: string, notificationIds: string[]) {
    try {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: userId
        },
        data: {
          isRead: true
        }
      })

      logger.info('Notifications marked as read', {
        userId,
        notificationIds,
        count: notificationIds.length
      })
    } catch (error) {
      logger.error('Failed to mark notifications as read', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        notificationIds
      })
      throw error
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      return await prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      })
    } catch (error) {
      logger.error('Failed to get unread count', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      })
      return 0
    }
  }

  static async getNotifications(userId: string, options: {
    page?: number
    limit?: number
    type?: string
    unreadOnly?: boolean
  } = {}) {
    const { page = 1, limit = 20, type, unreadOnly = false } = options
    const skip = (page - 1) * limit

    try {
      const where = {
        userId,
        ...(type && { type }),
        ...(unreadOnly && { isRead: false })
      }

      const [notifications, totalCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.notification.count({ where })
      ])

      return {
        notifications,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: page < Math.ceil(totalCount / limit)
        }
      }
    } catch (error) {
      logger.error('Failed to get notifications', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        options
      })
      throw error
    }
  }

  static async cleanup(olderThanDays: number = 90) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          },
          isRead: true
        }
      })

      logger.info('Notifications cleanup completed', {
        deletedCount: result.count,
        olderThanDays
      })

      return result.count
    } catch (error) {
      logger.error('Failed to cleanup notifications', {
        error: error instanceof Error ? error.message : 'Unknown error',
        olderThanDays
      })
      throw error
    }
  }

  private static async sendEmailNotification(notification: any) {
    // 이메일 발송 로직 (SMTP 설정 필요)
    // 현재는 로그만 기록
    logger.info('Email notification would be sent', {
      notificationId: notification.id,
      type: 'email'
    })
  }

  private static async sendPushNotification(notification: any) {
    // 푸시 알림 발송 로직 (FCM 등 설정 필요)
    // 현재는 로그만 기록
    logger.info('Push notification would be sent', {
      notificationId: notification.id,
      type: 'push'
    })
  }
}

// 일반적인 알림 템플릿
export const NotificationTemplates = {
  POST_LIKED: {
    type: 'post_liked',
    title: '게시글 좋아요',
    getMessage: (actorName: string, postTitle: string) => 
      `${actorName}님이 "${postTitle}" 게시글을 좋아합니다.`
  },
  
  POST_COMMENTED: {
    type: 'post_commented',
    title: '새 댓글',
    getMessage: (actorName: string, postTitle: string) => 
      `${actorName}님이 "${postTitle}" 게시글에 댓글을 남겼습니다.`
  },
  
  FOLLOW_REQUEST: {
    type: 'follow_request',
    title: '팔로우 요청',
    getMessage: (actorName: string) => 
      `${actorName}님이 팔로우를 요청했습니다.`
  },
  
  EVENT_REMINDER: {
    type: 'event_reminder',
    title: '이벤트 알림',
    getMessage: (eventTitle: string) => 
      `"${eventTitle}" 이벤트가 곧 시작됩니다.`
  },
  
  POINTS_EARNED: {
    type: 'points_earned',
    title: '포인트 획득',
    getMessage: (points: number, reason: string) => 
      `${reason}로 ${points}포인트를 획득했습니다!`
  },
  
  SYSTEM_NOTICE: {
    type: 'system_notice',
    title: '시스템 공지',
    getMessage: (message: string) => message
  }
}