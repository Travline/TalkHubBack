import express from 'express'
import type { Request, Response } from 'express'
import { turso } from '../core/db'
import type { Row } from '@libsql/client'
import type { CommentImplement, CommentResponse } from './comments.models'

const implementRouter = express.Router()

implementRouter.post('', async (req: Request<{}, {}, CommentImplement>, res: Response) => {
  try {
    const host = 'https://www.youtube.com'// `${req.protocol}://${req.hostname}`
    const fullUrl = req.header('Full-URL') as string
    if (!fullUrl.includes(host)) {
      return res.status(400).json({ error: 'URL does not match the host request' })
    }
    if (fullUrl === undefined) {
      return res.status(400).json({ error: 'Missing Full-URL header' })
    }
    const webRows = (await turso.execute(
      'SELECT idWeb, mode, anonName FROM webs WHERE domain = ?',
      [host]
    )).rows
    if (webRows.length === 0) {
      return res.status(404).json({ error: 'Web not found' })
    }
    const idWeb = (): number => {
      return (function () {
        return webRows.at(0) as Row
      })().idWeb as number
    }
    const webMode = (): string => {
      return (function () {
        return webRows.at(0) as Row
      })().mode as string
    }
    const anonName = (): string => {
      return (function () {
        return webRows.at(0) as Row
      })().anonName as string
    }
    let { rootId, replyTo, user, userRef, content } = req.body
    if (content === undefined || content.trim().length === 0) {
      return res.status(400).json({ error: 'Missing content' })
    }
    if (rootId === undefined || rootId === null) {
      rootId = null
      replyTo = null
    } else {
      if (replyTo === undefined || replyTo === null) {
        replyTo = rootId
      }
    }
    if (userRef === undefined || userRef === null) {
      userRef = null
    }
    if (webMode() === 'Anónimo') {
      user = anonName()
      userRef = null
    }
    await turso.execute(
      'INSERT INTO comments(idWeb, rootId, replyTo, fullURL, user, userRef, content) VALUES(?,?,?,?,?,?,?)',
      [idWeb(), rootId, replyTo, fullUrl, user, userRef, content]
    )
    await turso.execute(
      'UPDATE comments SET replies = replies + 1 WHERE idComment = ?',
      [replyTo]
    )
    return res.status(201).json({ message: 'Comment created' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error creating comment ' + (err as string) })
  }
})

implementRouter.get('/', async (req: Request, res: Response) => {
  try {
    const host = 'https://www.youtube.com'// `${req.protocol}://${req.hostname}`
    const fullUrl = req.header('Full-URL') as string
    if (!fullUrl.includes(host)) {
      return res.status(400).json({ error: 'URL does not match the host request' })
    }
    if (fullUrl === undefined) {
      return res.status(400).json({ error: 'Missing Full-URL header' })
    }
    const rootComments = (await turso.execute(
      'SELECT idComment, rootId, replyTo, user, userRef, content, created, replies \n' +
      'FROM comments \n' +
      'WHERE fullURL = ? AND rootId IS NULL AND replyTo IS NULL \n' +
      'ORDER BY created DESC',
      [fullUrl]
    )).rows
    return res.status(200).json(rootComments)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error loading comments' })
  }
})

implementRouter.get('/replies', async (req: Request, res: Response) => {
  try {
    const host = 'https://www.youtube.com'// `${req.protocol}://${req.hostname}`
    const fullUrl = req.header('Full-URL') as string
    if (!fullUrl.includes(host)) {
      return res.status(400).json({ error: 'URL does not match the host request' })
    }
    if (fullUrl === undefined) {
      return res.status(400).json({ error: 'Missing Full-URL header' })
    }
    const rootComments = (await turso.execute(
      'SELECT idComment, rootId, replyTo, user, userRef, content, created, replies \n' +
      'FROM comments \n' +
      'WHERE fullURL = ? AND rootId IS NULL AND replyTo IS NULL \n' +
      'ORDER BY created DESC',
      [fullUrl]
    )).rows
    const response: CommentResponse[] = []
    for (let i = 0; i < rootComments.length; i++) {
      const comment = rootComments.at(i) as Row
      const replies = (await turso.execute(
        'SELECT idComment, rootId, replyTo, user, userRef, content, created, replies \n' +
      'FROM comments \n' +
      'WHERE fullURL = ? AND rootId = ? \n' +
      'ORDER BY created ASC',
        [fullUrl, comment.idComment as number]
      )).rows
      response.push(
        {
          idComment: comment.idComment as number,
          rootId: comment.rootId as number,
          replyTo: comment.replyto as number,
          user: comment.user as string,
          userRef: comment.userRef as string ?? null,
          content: comment.content as string,
          replies: comment.replies as number,
          created: comment.created as string,
          comments: replies
        }
      )
    }
    return res.status(200).json(response)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error loading comments' })
  }
})

implementRouter.get('/replies/direct', async (req: Request, res: Response) => {
  try {
    const host = 'https://www.youtube.com'// `${req.protocol}://${req.hostname}`
    const fullUrl = req.header('Full-URL') as string
    if (!fullUrl.includes(host)) {
      return res.status(400).json({ error: 'URL does not match the host request' })
    }
    if (fullUrl === undefined) {
      return res.status(400).json({ error: 'Missing Full-URL header' })
    }
    const rootComments = (await turso.execute(
      'SELECT idComment, rootId, replyTo, user, userRef, content, created, replies \n' +
      'FROM comments \n' +
      'WHERE fullURL = ? AND rootId IS NULL AND replyTo IS NULL \n' +
      'ORDER BY created DESC',
      [fullUrl]
    )).rows
    const response: CommentResponse[] = []
    for (let i = 0; i < rootComments.length; i++) {
      const comment = rootComments.at(i) as Row
      const replies = (await turso.execute(
        'SELECT idComment, rootId, replyTo, user, userRef, content, created, replies \n' +
      'FROM comments \n' +
      'WHERE fullURL = ? AND replyTo = ? \n' +
      'ORDER BY created ASC',
        [fullUrl, comment.idComment as number]
      )).rows
      response.push(
        {
          idComment: comment.idComment as number,
          rootId: comment.rootId as number,
          replyTo: comment.replyto as number,
          user: comment.user as string,
          userRef: comment.userRef as string ?? null,
          content: comment.content as string,
          replies: comment.replies as number,
          created: comment.created as string,
          comments: replies
        }
      )
    }
    return res.status(200).json(response)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error loading comments' })
  }
})

export default implementRouter
