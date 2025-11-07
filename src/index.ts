import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRouter from './users/user.routes'
import clientRouter from './clients/clients.routes'
import dashboardRouter from './dashboard/dashboard.routes'

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: [
    'https://talkhubback.onrender.com',
    'http://localhost:4200',
    'http://localhost:3000'
  ],
  credentials: true
}))

app.use('/users', userRouter)
app.use('/clients', clientRouter)
app.use('/dashboard', dashboardRouter)

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log('Starting server')
})
