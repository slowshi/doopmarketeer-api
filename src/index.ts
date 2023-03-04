import express, { Request, Response } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { doops, history, feed, leaderboard } from './controller/DoopTransactions'
import * as dotenv from 'dotenv'
dotenv.config()

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
app.listen(port, () => {
  return console.log(`Server is listening on ${port}`)
})
