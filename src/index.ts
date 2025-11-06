import express from 'express'
import cookieParser from 'cookie-parser'
import userRouter from './user/user.routes'

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use('/user', userRouter)

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log('Starting server')
})
