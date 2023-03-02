import express, { Request, Response } from 'express'
import dotenv from 'dotenv'

const app = express()
const port = process.env.PORT || 8000
const test = 1

app.get('/', (_req: Request, res: Response) => {
  return res.send('Express Typescript on Vercel')
})
app.get('/ping', (_req: Request, res: Response) => {
  return res.send('pong 🏓')
})
app.listen(port, () => {
  return console.log(`Server is listening on ${port}`)
})
