import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { findUserById } from './repositories/users.repository.js'
import type { UserSchema } from './interfaces/interfaces.js'

const JWT_SECRET = process.env.JWT_SECRET as string

export const hashPassword = (password: string): string =>
  crypto.createHash('sha256').update(password).digest('hex')

export const createToken = (user: UserSchema): string =>
  'Bearer ' + jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' })

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      const user = await findUserById(payload.sub)
      return user ? done(null, user) : done(null, false)
    }
  )
)
