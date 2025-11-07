import express from 'express'
import type { Request, Response } from 'express'
import { turso } from '../core/db'
// import type { Row } from '@libsql/client'

const clientRouter = express.Router()

clientRouter.post('/addClient/:tier', async (req: Request, res: Response) => {
  try {
    const { tier } = req.params
    const iduser: string = req.cookies['talkhub-cookie']
    if (iduser === undefined) {
      return res.status(401).json({ error: 'Missing cookies' })
    }
    const tiers = new Set(['1', '2', '3'])
    if (tier === undefined || !tiers.has(tier)) {
      return res.status(400).json({ error: 'Unexpected tier' })
    }
    await turso.execute(
      'INSERT INTO clients(idUser, idTier) VALUES (?,?)',
      [iduser, tier ?? 0]
    )
    return res.status(201).json({ message: 'Client created' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error creating client' })
  }
})

export default clientRouter
