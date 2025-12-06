import type { Prisma } from '@prisma/client'
import { prisma } from './prisma.js'
import { presenceStore } from './presence.js'
import { BadRequestException, NotFoundException } from '../errors/httpExceptions.js'
import { getProfileImageUrl, getUserMediaUrl } from './s3Client.js'

const conversationInclude = {
  participants: {
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          about: true,
          avatarUrl: true,
          status: true
        }
      },
      lastReadAt: true,
      userId: true
    }
  },
  messages: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    include: {
      media: {
        select: { url: true, mimeType: true }
      }
    }
  }
} satisfies Prisma.ConversationInclude

type ConversationWithRelations = Prisma.ConversationGetPayload<{
  include: typeof conversationInclude
}>

const serializeParticipant = async (user: {
  id: string
  name: string
  email: string
  about: string | null
  avatarUrl: string | null
  status: string
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  about: user.about ?? '',
  avatar: await getProfileImageUrl(user.avatarUrl),
  status: presenceStore.isOnline(user.id) ? 'online' : 'offline'
})

const serializeMessage = async (message?: {
  id: string
  conversationId: string
  senderId: string
  type: string
  content: string | null
  createdAt: Date
  media?: { url: string | null; mimeType: string | null }[]
} | null) => {
  if (!message) return null

  const mediaUrl = message.media?.[0]?.url
  const signedMediaUrl = mediaUrl ? await getUserMediaUrl(mediaUrl) : undefined
  const hasMedia = Boolean(signedMediaUrl)
  const contentText = (message.content ?? '').trim()
  const displayContent =
    contentText.length > 0 ? contentText : hasMedia ? 'Photo' : ''

  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    type: hasMedia ? 'IMAGE' : message.type,
    content: displayContent,
    imageUrl: signedMediaUrl,
    createdAt: message.createdAt,
    status: 'sent' as const
  }
}

const serializeConversation = async (
  conversation: ConversationWithRelations,
  userId: string
) => {
  const unreadCount = await prisma.message.count({
    where: {
      conversationId: conversation.id,
      senderId: { not: userId },
      isRead: false
    }
  })

  const participants = await Promise.all(
    conversation.participants.map((p) => serializeParticipant(p.user))
  )

  return {
    id: conversation.id,
    participants,
    lastMessage: await serializeMessage(conversation.messages[0] ?? null),
    unreadCount,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  }
}

const findConversationBetweenUsers = (userId: string, participantId: string) =>
  prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: participantId } } }
      ]
    },
    include: conversationInclude
  })

export const conversationsService = {
  async listForUser(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId }
        }
      },
      orderBy: { updatedAt: 'desc' },
      include: conversationInclude
    })

    const results = await Promise.all(
      conversations.map((conversation) => serializeConversation(conversation, userId))
    )

    return results
  },

  async create(userId: string, participantId: string) {
    return this.getOrCreate(userId, participantId)
  },

  async getOrCreate(userId: string, participantId: string) {
    if (userId === participantId) {
      throw new BadRequestException('Cannot start a conversation with yourself')
    }

    const participant = await prisma.user.findUnique({
      where: { id: participantId },
      select: { id: true }
    })

    if (!participant) {
      throw new NotFoundException('User not found')
    }

    const existing = await findConversationBetweenUsers(userId, participantId)
    if (existing) {
      return serializeConversation(existing, userId)
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId }, { userId: participantId }]
        }
      }
    })

    const created = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: conversationInclude
    })

    if (!created) {
      throw new NotFoundException('Conversation not found after creation')
    }

    return serializeConversation(created, userId)
  }
}

