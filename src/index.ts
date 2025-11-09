import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRouter from './users/user.routes'
import clientRouter from './clients/clients.routes'
import dashboardRouter from './dashboard/dashboard.routes'
import configRouter from './dashboard/config/config.routes'
import implementRouter from './comments/implement.routes'
// import inboxRouter from './comments/inbox.routes'

const app = express()

app.use(express.json())
app.use(cookieParser())
app.set('trust proxy', true)
app.use(cors({
  origin: [
    'https://talkhubback.onrender.com',
    'http://localhost:4200',
    'http://localhost:3000',
    'https://saas-angular.vercel.app/'
  ],
  credentials: true
}))

app.use('/users', userRouter)
app.use('/clients', clientRouter)
app.use('/dashboard', dashboardRouter)
app.use('/dashboard/config', configRouter)
app.use('/comments/implement', implementRouter)
// app.use('/comments/inbox', inboxRouter)

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log('Starting server')
})
