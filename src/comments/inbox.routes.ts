import express from 'express'
import type { Request, Response } from 'express'
import { turso } from '../core/db'
import type { Row } from '@libsql/client'
import type { CommentResponse } from './comments.models'

const inboxRouter = express.Router()

inboxRouter.get('/:idWeb', async (req: Request, res: Response) => {
  try {
    const idUser: string = req.cookies['talkhub-cookie']
    if (idUser === undefined) {
      return res.status(401).json({ error: 'Missing cookies' })
    }
    const { idWeb } = req.params
    if (idWeb === undefined) {
      return res.status(400).json({ error: 'Missing idWeb' })
    }
    const modRows = (await turso.execute(
      'SELECT idMod FROM mods WHERE idUser = ? AND idWeb = ?',
      [idUser, idWeb]
    )).rows
    console.log(modRows)
    if (modRows.length === 0) {
      return res.status(404).json({ error: 'Mod not found' })
    }
    const commentRows = (await turso.execute(
      'SELECT * FROM comments WHERE idWeb = ? ORDER BY created DESC',
      [idWeb]
    )).rows
    return res.status(200).json(commentRows)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error fetching data' })
  }
})

inboxRouter.get('/:idWeb/:idComment', async (req: Request, res: Response) => {
  try {
    const idUser: string = req.cookies['talkhub-cookie']
    if (idUser === undefined) {
      return res.status(401).json({ error: 'Missing cookies' })
    }
    const { idWeb, idComment } = req.params
    if (idWeb === undefined) {
      return res.status(400).json({ error: 'Missing idWeb' })
    }
    if (idComment === undefined) {
      return res.status(400).json({ error: 'Missing idComment' })
    }
    const modRows = (await turso.execute(
      'SELECT idMod FROM mods WHERE idUser = ? AND idWeb = ?',
      [idUser, idWeb]
    )).rows
    if (modRows.length === 0) {
      return res.status(404).json({ error: 'Mod not found' })
    }
    const commentRows = (await turso.execute(
      'SELECT * FROM comments WHERE idWeb = ? AND idComment = ?',
      [idWeb, idComment]
    )).rows
    if (commentRows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' })
    }
    const response: CommentResponse[] = []
    for (let i = 0; i < commentRows.length; i++) {
      const comment = commentRows.at(i) as Row
      const replies = (await turso.execute(
        'SELECT * FROM comments WHERE rootId = ?',
        [idComment]
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
          comments: replies
        }
      )
    }
    return res.status(200).json(response)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error fetching data' })
  }
})

/* inboxRouter.post('/:idWeb/:idComment/:content', async (req: Request, res: Response) => {
  try {
    const idUser: string = req.cookies['talkhub-cookie']
    if (idUser === undefined) {
      return res.status(401).json({ error: 'Missing cookies' })
    }
    const { idWeb, idComment, content } = req.params
    if (idWeb === undefined) {
      return res.status(400).json({ error: 'Missing idWeb' })
    }
    if (idComment === undefined) {
      return res.status(400).json({ error: 'Missing idComment' })
    }
    if (content === undefined) {
      return res.status(400).json({ error: 'Missing content' })
    }
    const modRows = (await turso.execute(
      'SELECT idMod FROM mods WHERE idUser = ? AND idWeb = ?',
      [idUser, idWeb]
    )).rows
    if (modRows.length === 0) {
      return res.status(404).json({ error: 'Mod not found' })
    }
    const webRows = (await turso.execute(
      'SELECT mode, anonName, modName, addName FROM webs WHERE idWeb = ?',
      [idWeb]
    )).rows
    if (webRows.length === 0) {
      return res.status(404).json({ error: 'Web not found' })
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
    if (content === undefined || content.trim().length === 0) {
      return res.status(400).json({ error: 'Missing content' })
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
    return res.status(500).json({ error: 'Error creating comment' })
  }
}) */

export default inboxRouter
