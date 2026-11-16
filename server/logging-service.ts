import { appendFile, mkdir } from 'node:fs/promises'
import express, { type Express, type Request, type Response } from 'express'
import { config } from './config.js'
import { redis, USER_CREATED_CHANNEL } from './src/redis.js'
import { logger } from './src/logger.js'
import { errorMiddleware, ValidationError } from './src/error/errorHandler.js'

const LOG_FILE = 'logs/users.log'

const writeLog = async (data: unknown) => {
  const line = `${new Date().toISOString()} ${JSON.stringify(data)}\n`
  await appendFile(LOG_FILE, line)
}

const app: Express = express()
app.use(express.json())

app.post('/logs', async (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ValidationError('Log data is required')
  }
  await writeLog(req.body)
  res.status(201).json({ success: true })
})

app.use(errorMiddleware)

await mkdir('logs', { recursive: true })

const subscriber = redis.duplicate()
await subscriber.connect()

await subscriber.subscribe(USER_CREATED_CHANNEL, (message: string) => {
  writeLog({ event: 'user created', user: JSON.parse(message) }).catch((err: Error) =>
    logger.error(`Failed to write log: ${err.message}`)
  )
})
logger.info(`LoggingService subscribed to "${USER_CREATED_CHANNEL}"`)

app.listen(config.loggerPort, config.host, () => {
  logger.info(`LoggingService listening on ${config.host}:${config.loggerPort}`)
})
