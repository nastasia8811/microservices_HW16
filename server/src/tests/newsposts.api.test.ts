import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../../app.js'
import { AppDataSource } from '../db/data-source.js'
import { Newspost } from '../entities/Newspost.js'
import { User } from '../entities/User.js'
import { connectTestDb, clearDb, closeTestDb } from './db.js'
import { getToken, post } from './helpers.js'

describe('API /api/newsposts', () => {
  let token: string

  beforeAll(connectTestDb)
  afterAll(closeTestDb)

  beforeEach(async () => {
    await clearDb()
    token = await getToken()
  })

  const createPost = (data: object = post) =>
    request(app).post('/api/newsposts').set('Authorization', token).send(data)

  const savePosts = async (count: number) => {
    const author = await AppDataSource.getRepository(User).findOneByOrFail({ id: 1 })
    const repo = AppDataSource.getRepository(Newspost)
    await repo.save(
      Array.from({ length: count }, (_, i) =>
        repo.create({ ...post, title: `Post ${i + 1}`, author })
      )
    )
  }

  describe('POST /api/newsposts', () => {
    it('creates a post and saves it in the database', async () => {
      const res = await createPost()

      expect(res.status).toBe(201)
      expect(res.body).toMatchObject({ id: expect.any(Number), title: 'Title', genre: 'Sport' })

      const saved = await AppDataSource.getRepository(Newspost).findOne({
        where: { id: res.body.id },
        relations: { author: true },
      })
      expect(saved?.text).toBe('Some text')
      expect(saved?.author.email).toBe('bob@test.com')
    })

    it('returns 401 without a token', async () => {
      const res = await request(app).post('/api/newsposts').send(post)

      expect(res.status).toBe(401)
      expect(await AppDataSource.getRepository(Newspost).count()).toBe(0)
    })

    it('returns 400 for invalid data and saves nothing', async () => {
      const res = await createPost({ ...post, genre: 'Unknown' })

      expect(res.status).toBe(400)
      expect(await AppDataSource.getRepository(Newspost).count()).toBe(0)
    })
  })

  describe('GET /api/newsposts', () => {
    it('returns posts with pagination', async () => {
      await savePosts(3)

      const res = await request(app).get('/api/newsposts?page=1&size=2')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].title).toBe('Post 3')
    })

    it('returns an empty list when there are no posts', async () => {
      const res = await request(app).get('/api/newsposts')

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })
  })

  describe('GET /api/newsposts/:id', () => {
    it('returns the post by id', async () => {
      const created = await createPost()

      const res = await request(app).get(`/api/newsposts/${created.body.id}`)

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({ id: created.body.id, title: 'Title' })
    })

    it('returns 404 for a non-existent post', async () => {
      const res = await request(app).get('/api/newsposts/999')

      expect(res.status).toBe(404)
      expect(res.body.message).toBe('Newspost not found')
    })
  })

  describe('PUT /api/newsposts/:id', () => {
    it('updates the post and the next GET sees the change', async () => {
      const created = await createPost()

      await request(app)
        .put(`/api/newsposts/${created.body.id}`)
        .send({ title: 'New title' })
        .expect(200)

      const res = await request(app).get(`/api/newsposts/${created.body.id}`)
      expect(res.body.title).toBe('New title')
    })

    it('returns 400 for invalid data and does not change the post', async () => {
      const created = await createPost()

      const res = await request(app)
        .put(`/api/newsposts/${created.body.id}`)
        .send({ title: 'a'.repeat(51) })

      expect(res.status).toBe(400)
      const saved = await AppDataSource.getRepository(Newspost).findOneBy({ id: created.body.id })
      expect(saved?.title).toBe('Title')
    })

    it('returns 404 for a non-existent post', async () => {
      const res = await request(app).put('/api/newsposts/999').send({ title: 'New title' })

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/newsposts/:id', () => {
    it('deletes the post and the next GET returns 404', async () => {
      const created = await createPost()

      const res = await request(app).delete(`/api/newsposts/${created.body.id}`)

      expect(res.status).toBe(200)
      await request(app).get(`/api/newsposts/${created.body.id}`).expect(404)
      expect(await AppDataSource.getRepository(Newspost).count()).toBe(0)
    })

    it('returns 404 for a non-existent post', async () => {
      const res = await request(app).delete('/api/newsposts/999')

      expect(res.status).toBe(404)
    })
  })
})
