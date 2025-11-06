import express from 'express'
import cookieParser from 'cookie-parser'
import userRouter from './users/user.routes'
import clientRouter from './clients/clients.routes'

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use('/users', userRouter)
app.use('/clients', clientRouter)

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log('Starting server')
})
