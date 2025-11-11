import type { Row } from '@libsql/client'

export interface CommentImplement {
  idComment?: number
  rootId?: number | null
  replyTo?: number | null
  user: string
  userRef?: string | null
  content: string
}

export interface CommentResponse {
  idComment: number
  rootId: number | null
  replyTo: number | null
  user: string
  userRef: string | null
  content: string
  replies: number
  created: string
  comments: Row[]
}
