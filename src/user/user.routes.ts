import express from 'express'
import type { Request, Response } from 'express'
import { turso } from '../core/db'
import type { UserCreate } from './user.models'

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

export default userRouter
