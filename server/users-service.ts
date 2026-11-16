import express, { type Express, type Response } from 'express'
import { config } from './config.js'
import { redis, USER_CREATED_CHANNEL } from './src/redis.js'
import { logger } from './src/logger.js'
import { errorMiddleware, NotFoundError, ValidationError } from './src/error/errorHandler.js'
import { ajv, validateRedisUser } from './src/validation/validation.js'
import type { RedisUserSchema } from './src/interfaces/interfaces.js'
import type { CreateRedisUserRequest, RedisUserByIdRequest } from './src/types/types.js'

const app: Express = express()
app.use(express.json())

app.post('/users/create', async (req: CreateRedisUserRequest, res: Response) => {
  if (!validateRedisUser(req.body)) {
    throw new ValidationError(ajv.errorsText(validateRedisUser.errors))
  }

  const id = await redis.incr('users:lastId')
  const user: RedisUserSchema = { id, ...req.body, createDate: new Date().toISOString() }

  await redis.set(`user:${id}`, JSON.stringify(user))

  await redis.publish(USER_CREATED_CHANNEL, JSON.stringify(user))

  res.status(201).json(user)
})

app.get('/users/:id', async (req: RedisUserByIdRequest, res: Response) => {
  const data = await redis.get(`user:${req.params.id}`)

  if (!data) {
    throw new NotFoundError(`User ${req.params.id} not found`)
  }
  res.json(JSON.parse(data))
})

app.use(errorMiddleware)

await redis.connect()
logger.info('UserService: Redis connected')

app.listen(config.usersPort, config.host, () => {
  logger.info(`UserService listening on ${config.host}:${config.usersPort}`)
})
