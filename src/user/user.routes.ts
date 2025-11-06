import express from 'express'
import type { Request, Response } from 'express'
import { turso } from '../core/db'
import type { Row } from '@libsql/client'
import type { UserCreate, UserLogin } from './user.models'

const userRouter = express.Router()

userRouter.post('/register', async (req: Request<{}, {}, UserCreate>, res: Response) => {
  try {
    const { name, mail, pwd } = req.body
    await turso.execute(
      'INSERT INTO users (name, mail, pwd) VALUES (?,?,?)',
      [name, mail, pwd]
    )
    const idUser = await turso.execute(
      'SELECT idUser FROM users WHERE mail = ?',
      [mail]
    )
    res
      .status(201)
      .cookie('talkhub-cookie', idUser)
      .json({ message: 'User created' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error creating user' })
  }
})

userRouter.post('/login', async (req: Request<{}, {}, UserLogin>, res: Response) => {
  try {
    const { mail, pwd } = req.body
    const data: Row[] = (await turso.execute(
      'SELECT idUser FROM users WHERE mail = ? AND pwd = ? LIMIT 1',
      [mail, pwd]
    )).rows
    if (data.length === 0) {
      res.status(404).json({ error: 'User not founds' })
    }
    const row: Row = data.at(0) as Row
    console.log(row[0])
    res
      .status(200)
      .cookie('talkhub-cookie', row[0])
      .json({ message: 'User found' })
  } catch (err) {
    console.error(err)
    res.status(404).json({ error: 'User not founds' })
  }
})

export default userRouter
