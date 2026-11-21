import path from 'node:path'
import { config } from './config.js'
import express, { type Express, type Request, type Response, type NextFunction } from 'express'
import newspostsRouter from './src/routes/newsposts.router.js'
import { ErrorHandler } from './src/error/errorHandler.js'
import { ValidationError } from './src/error/errorHandler.js'
import passport from 'passport'
import authRoutes from './src/routes/auth.router.js'
import { logger } from './src/logger.js'
import swaggerUi from 'swagger-ui-express'

const app: Express = express()
const clientDistPath = path.join(import.meta.dirname, '../client/dist')

app.use(express.json())
app.use(passport.initialize())

const hiddenFields = ['password', 'confirmPassword']

app.use((req: Request, _res: Response, next: NextFunction) => {
  const hasBody = req.body && Object.keys(req.body).length > 0
  const safeBody = { ...req.body }
  for (const field of hiddenFields) {
    if (field in safeBody) safeBody[field] = '***'
  }
  const body = hasBody ? ` ${JSON.stringify(safeBody)}` : ''
  logger.info(`${req.method} ${req.originalUrl}${body}`)
  next()
})

app.use(authRoutes)

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }))

app.use('/api/newsposts', newspostsRouter)

const nativeReplaceAll = String.prototype.replaceAll
const { default: swaggerAutogen } = await import('swagger-autogen')
const swagger = await swaggerAutogen()('./swagger.json', ['./app.ts'], {
  info: { title: 'News API', description: 'API news service' },
  host: `${config.host}:${config.port}`,
})
String.prototype.replaceAll = nativeReplaceAll

if (swagger) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger.data))
}

app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(clientDistPath, 'index.html'))
})

app.use(express.static(clientDistPath))

app.get('/{*splat}', (_req: Request, res: Response) => {
  res.sendFile(path.join(clientDistPath, 'index.html'))
})

app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err)
  }
  if (err instanceof ValidationError) {
    logger.warn(err.message)
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }
  logger.error(err.stack)
  if (err instanceof ErrorHandler) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  }
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  })
})

export default app
