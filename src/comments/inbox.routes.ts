import express from 'express'
import type { Request, Response } from 'express'
import { turso } from '../core/db'
// import type { Row } from '@libsql/client'

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
    if (modRows.length === 0) {
      return res.status(404).json({ error: 'Mod not found' })
    }
    const commentRows = (await turso.execute(
      'SELECT * FROM comments WHERE idWeb = ?',
      [idWeb]
    )).rows
    return res.status(200).json(commentRows)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error fetching data' })
  }
})

export default inboxRouter
