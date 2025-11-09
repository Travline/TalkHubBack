import express from 'express'
import type { Request, Response } from 'express'
// import { turso } from '../core/db'
// import type { Row } from '@libsql/client'

const configRouter = express.Router()

configRouter.get('/:idWeb', async (_req: Request, _res: Response) => {

})

export default configRouter
