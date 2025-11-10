import express from 'express'
import type { Request, Response } from 'express'
import { turso } from '../core/db'
// import type { Row } from '@libsql/client'

const clientRouter = express.Router()

clientRouter.post('/addClient/:tier', async (req: Request, res: Response) => {
  try {
    const { tier } = req.params
    const idUser: string = req.cookies['talkhub-cookie']
    if (idUser === undefined) {
      return res.status(401).json({ error: 'Missing cookies' })
    }
    const tiers = new Set(['1', '2', '3'])
    if (tier === undefined || !tiers.has(tier)) {
      return res.status(400).json({ error: 'Unexpected tier' })
    }
    await turso.execute(
      'INSERT INTO clients(idUser, idTier) VALUES (?,?)',
      [idUser, tier ?? 0]
    )
    return res.status(201).json({ message: 'Client created' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error creating client' })
  }
})

clientRouter.get('/data', async (req: Request, res: Response) => {
  try {
    const idUser: string = req.cookies['talkhub-cookie']
    if (idUser === undefined) {
      return res.status(401).json({ error: 'Missing cookies' })
    }
    const client = (await turso.execute(
      'SELECT idClient, idUser, idTier, status FROM clients WHERE idUser = ?',
      [idUser]
    )).rows
    return res.status(200).json(client.at(0))
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error fetching client data' })
  }
})

export default clientRouter
