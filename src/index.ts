import * as dotenv from 'dotenv'
dotenv.config()
import express, { Request, Response } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { doops, history, feed, leaderboard } from './controller/DoopTransactions'

import { doopmarket } from './controller/DoopMarket'
import { assets } from './controller/Assets'
import { doodleFloor, doopFloor } from './controller/Undooped'

const app = express()
const port = process.env.PORT || 8000
app.use(cors())
app.use(bodyParser.json())

app.get('/', (req: Request, res: Response) => {
  res.json({})
})

app.get('/doops', doops)
app.get('/history', history)
app.get('/feed', feed)
app.get('/leaderboard', leaderboard)

app.get('/doopmarket', doopmarket)

app.get('/assets/:tokenId', assets)

app.get('/doop-floor', doopFloor)
app.get('/doodle-floor', doodleFloor)

app.listen(port, () => {
  return console.log(`Server is listening on ${port}`)
})
