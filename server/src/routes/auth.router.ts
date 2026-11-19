import { Router } from 'express'
import passport from 'passport'
import { AuthService } from '../services/auth.service.js'
import type { UserSchema } from '../interfaces/interfaces.js'

const router = Router()

router.post('/auth/register', async (req, res) => {
  res.status(201).json(await AuthService.register(req.body))
})

router.post('/auth/login', async (req, res) => {
  res.json(await AuthService.login(req.body))
})

router.get('/user', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err: unknown, user: UserSchema | false) => {
    if (err) return next(err)

    if (!user) {
      res.status(401).json({ message: 'Unauthorized request' })
      return
    }

    res.json({ id: user.id, email: user.email, createDate: user.createDate })
  })(req, res, next)
})

export default router
