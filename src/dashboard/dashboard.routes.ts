import express from 'express'
import type { Request, Response } from 'express'
import { turso } from '../core/db'
// import type { Row } from '@libsql/client'

const dashboardRouter = express.Router()

dashboardRouter.get('/roles', async (req: Request, res: Response) => {
  try {
    const idUser: string = req.cookies['talkhub-cookie']
    if (idUser === undefined) {
      return res.status(401).json({ error: 'Missing cookies' })
    }

    const clientRows = (await turso.execute(
      'SELECT status FROM clients WHERE idUser = ?',
      [idUser]
    )).rows
    const clientExists = (): boolean => {
      if (clientRows.length === 0) {
        return false
      }
      return true
    }

    const modRows = (await turso.execute(
      'SELECT idMod FROM mods WHERE idUser = ?',
      [idUser]
    )).rows
    const modExists = (): boolean => {
      if (modRows.length === 0) {
        return false
      }
      return true
    }

    if (!clientExists() && !modExists()) {
      return res.status(400).json({ error: 'Role not founds' })
    }

    return res.status(200).json({
      clientRole: clientExists(),
      modRole: modExists()
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error creating client' })
  }
})

export default dashboardRouter
