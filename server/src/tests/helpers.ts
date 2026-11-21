import request from 'supertest'
import app from '../../app.js'

export const bob = { email: 'bob@test.com', password: 'qwe123', confirmPassword: 'qwe123' }

export async function getToken(email = bob.email) {
  const res = await request(app)
    .post('/auth/register')
    .send({ ...bob, email })
  return res.body.token as string
}

export const post = { title: 'Title', text: 'Some text', genre: 'Sport', isPrivate: false }
