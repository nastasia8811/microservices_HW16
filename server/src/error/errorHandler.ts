import type { Request, Response, NextFunction } from 'express'
import { logger } from '../logger.js'

class ErrorHandler extends Error {
  statusCode: number

  constructor(message: string, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ErrorHandler'
  }
}

class ValidationError extends ErrorHandler {
  constructor(message: string) {
    super(message, 400)
    this.name = 'ValidationError'
  }
}

class NewspostsServiceError extends ErrorHandler {
  constructor(message: string) {
    super(message, 500)
    this.name = 'NewspostsServiceError'
  }
}

class NotFoundError extends ErrorHandler {
  constructor(message: string) {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

// for UserService and LoggingService
const errorMiddleware = (err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err)
  }
  if (err instanceof ErrorHandler) {
    logger.warn(err.message)
    return res.status(err.statusCode).json({ success: false, message: err.message })
  }
  logger.error(err.stack)
  res.status(500).json({ success: false, message: 'Internal Server Error' })
}

export { ErrorHandler, ValidationError, NewspostsServiceError, NotFoundError, errorMiddleware }
