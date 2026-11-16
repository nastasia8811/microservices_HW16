import { createClient } from 'redis'
import { config } from '../config.js'
import { logger } from './logger.js'

export const USER_CREATED_CHANNEL = 'user:created'

export const redis = createClient({ url: config.redisUrl })

redis.on('error', (err: Error) => logger.error(`Redis error: ${err.message}`))
