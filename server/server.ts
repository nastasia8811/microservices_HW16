import { config } from './config.js'
import { AppDataSource } from './src/db/data-source.js'
import { logger } from './src/logger.js'
import app from './app.js'

await AppDataSource.initialize()
logger.info('Database connected')

if (!process.env.VERCEL) {
  app.listen(config.port, config.host, (): void => {
    logger.info(`Listening on ${config.host}:${config.port}`)
  })
}

export default app
