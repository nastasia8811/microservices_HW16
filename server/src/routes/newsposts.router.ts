import { type Response, Router } from 'express'
import passport from 'passport'
import type { UserSchema } from '../interfaces/interfaces.js'

import type {
  CreateNewspostRequest,
  DeleteNewspostRequest,
  GetNewspostsRequest,
  NewspostByIdRequest,
  UpdateNewspostRequest,
} from '../types/types.js'
import { NewspostsService } from '../services/newsposts.service.js'
import { ErrorHandler } from '../error/errorHandler.js'

const router = Router()

router.get('/error', () => {
  NewspostsService.throwError()
})

router.get('/', async (req: GetNewspostsRequest, res: Response) => {
  const page = Number(req.query.page) || 0
  const size = Number(req.query.size) || 10
  const newsposts = await NewspostsService.getAll({ page, size })
  return res.json(newsposts)
})

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req: CreateNewspostRequest, res: Response) => {
    const newspost = await NewspostsService.create(req.body, req.user as UserSchema)
    return res.status(201).json(newspost)
  }
)

router.get('/:id', async (req: NewspostByIdRequest, res: Response) => {
  const id = parseInt(req.params.id)
  const newspost = await NewspostsService.getById(id)

  if (!newspost) return res.status(404).json({ message: 'Newspost not found' })

  return res.json(newspost)
})

router.put('/:id', async (req: UpdateNewspostRequest, res: Response) => {
  const id = parseInt(req.params.id)
  const updatedPost = await NewspostsService.update(id, req.body)

  if (!updatedPost) throw new ErrorHandler('Newspost not found', 404)
  return res.json(updatedPost)
})

router.delete('/:id', async (req: DeleteNewspostRequest, res: Response) => {
  const id = parseInt(req.params.id)
  if (Number.isNaN(id)) return res.status(404).json({ message: 'Newspost not found' })

  const post = await NewspostsService.getById(id)
  if (!post) return res.status(404).json({ message: 'Newspost not found' })

  await NewspostsService.delete(id)
  return res.status(200).json({ message: 'Newspost deleted' })
})

export default router
