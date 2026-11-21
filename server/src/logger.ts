import winston from 'winston'

export const logger = winston.createLogger({
  level: 'info',
  silent: process.env.NODE_ENV === 'test',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}] ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    ...(process.env.VERCEL ? [] : [new winston.transports.File({ filename: 'logs/app.log' })]),
  ],
})
