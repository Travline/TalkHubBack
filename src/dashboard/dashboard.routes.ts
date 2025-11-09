import express from 'express'
import type { Request, Response } from 'express'
import { turso } from '../core/db'
import type { Row } from '@libsql/client'

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
    return res.status(500).json({ error: 'Error verifying role' })
  }
})

dashboardRouter.post('/addWeb/:domain', async (req: Request, res: Response) => {
  try {
    const idUser: string = req.cookies['talkhub-cookie']
    if (idUser === undefined) {
      return res.status(401).json({ error: 'Missing cookies' })
    }
    const { domain } = req.params
    if (domain === undefined) {
      return res.status(400).json({ error: 'Unexcpected domain' })
    }
    const clientRows = (await turso.execute(
      'SELECT idClient FROM clients WHERE idUser = ?',
      [idUser]
    )).rows
    if (clientRows.length === 0) {
      return res.status(404).json({ error: 'Client not found' })
    }
    const idClient = (): number => {
      return (function (): Row {
        return clientRows.at(0) as Row
      })().idClient as number
    }
    const idWeb = (): string => {
      const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let resultado = ''
      for (let i = 0; i < 16; i++) {
        const indice = Math.floor(Math.random() * caracteres.length)
        resultado += caracteres[indice] as string
      }
      return resultado
    }
    await turso.execute(
      'INSERT INTO webs(idWeb, idClient, domain) VALUES (?,?,?)',
      [idWeb(), idClient(), domain]
    )
    return res.status(201).json({ message: 'Web added' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error adding web' })
  }
})

dashboardRouter.get('/client', async (req: Request, res: Response) => {
  try {
    const idUser: string = req.cookies['talkhub-cookie']
    if (idUser === undefined) {
      return res.status(401).json({ error: 'Missing cookies' })
    }
    const clientRows = (await turso.execute(
      'SELECT idClient FROM clients WHERE idUser = ?',
      [idUser]
    )).rows
    if (clientRows.length === 0) {
      return res.status(404).json({ error: 'Client not found' })
    }
    const idClient = (): number => {
      return (function (): Row {
        return clientRows.at(0) as Row
      })().idClient as number
    }
    const webs = (await turso.execute(
      'SELECT idWeb, domain, mode, status FROM webs WHERE idClient = ?',
      [idClient()]
    )).rows
    return res.status(201).json(webs)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error adding web' })
  }
})

// Añadir el get de /mod cuando se añada el registro de moderadores

export default dashboardRouter
