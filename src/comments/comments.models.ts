export interface CommentImplement {
  idComment?: number
  rootId?: number | null
  replyTo?: number | null
  user: string
  userRef?: string | null
  content: string
}
