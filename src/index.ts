import express from 'express'
import cookieParser from 'cookie-parser'
import userRouter from './user/user.routes'

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use('/user', userRouter)

app.listen(1591, () => {
  console.log('Starting server')
})
