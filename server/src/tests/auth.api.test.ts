import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../../app.js'
import { AppDataSource } from '../db/data-source.js'
import { User } from '../entities/User.js'
import { connectTestDb, clearDb, closeTestDb } from './db.js'
import { bob } from './helpers.js'

describe('API /auth', () => {
  beforeAll(connectTestDb)
  afterAll(closeTestDb)
  beforeEach(clearDb)

  describe('POST /auth/register', () => {
    it('returns a token and stores the password hash', async () => {
      const res = await request(app).post('/auth/register').send(bob)

      expect(res.status).toBe(201)
      expect(res.body.token).toMatch(/^Bearer /)

      const user = await AppDataSource.getRepository(User).findOne({
        where: { email: bob.email },
        select: { id: true, password: true },
      })
      expect(user).not.toBeNull()
      expect(user?.password).not.toBe(bob.password)
    })

    it('returns 409 for an already registered email', async () => {
      await request(app).post('/auth/register').send(bob).expect(201)

      const res = await request(app).post('/auth/register').send(bob)

      expect(res.status).toBe(409)
      expect(await AppDataSource.getRepository(User).count()).toBe(1)
    })

    it('returns 400 when the passwords do not match', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ ...bob, confirmPassword: 'other' })

      expect(res.status).toBe(400)
      expect(await AppDataSource.getRepository(User).count()).toBe(0)
    })
  })

  describe('POST /auth/login', () => {
    it('returns a token that opens protected routes', async () => {
      await request(app).post('/auth/register').send(bob)

      const login = await request(app)
        .post('/auth/login')
        .send({ email: bob.email, password: bob.password })
      expect(login.status).toBe(200)

      const me = await request(app).get('/user').set('Authorization', login.body.token)
      expect(me.status).toBe(200)
      expect(me.body.email).toBe(bob.email)
    })

    it('returns 401 for a wrong password', async () => {
      await request(app).post('/auth/register').send(bob)

      const res = await request(app)
        .post('/auth/login')
        .send({ email: bob.email, password: 'wrong' })

      expect(res.status).toBe(401)
    })

    it('returns 401 for an unknown email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'nobody@test.com', password: 'qwe123' })

      expect(res.status).toBe(401)
    })
  })

  describe('GET /user', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app).get('/user')

      expect(res.status).toBe(401)
    })
  })
})
