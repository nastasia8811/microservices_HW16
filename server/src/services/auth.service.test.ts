import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import type { createUser, findUserByEmail } from '../repositories/users.repository.js'
import type { User } from '../entities/User.js'

const SECRET = 'test-secret'
process.env.JWT_SECRET = SECRET

const findUserByEmailMock = jest.fn<typeof findUserByEmail>()
const createUserMock = jest.fn<typeof createUser>()

jest.unstable_mockModule('../repositories/users.repository.js', () => ({
  findUserByEmail: findUserByEmailMock,
  createUser: createUserMock,
  findUserById: jest.fn(),
}))

const { AuthService } = await import('./auth.service.js')

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex')

const registerBody = { email: 'bob@test.com', password: 'qwe123', confirmPassword: 'qwe123' }

const savedUser = (id: number, email: string, password: string) =>
  ({ id, email, password, createDate: new Date(), deleted: false }) as User

describe('AuthService', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('register', () => {
    it('stores the password hash, not the password itself', async () => {
      findUserByEmailMock.mockResolvedValue(null)
      createUserMock.mockImplementation(async (email, password) => savedUser(1, email, password))

      await AuthService.register(registerBody)

      const [email, password] = createUserMock.mock.calls[0]!
      expect(email).toBe('bob@test.com')
      expect(password).not.toBe('qwe123')
      expect(password).toBe(sha256('qwe123'))
    })

    it('returns a token with the user id', async () => {
      findUserByEmailMock.mockResolvedValue(null)
      createUserMock.mockImplementation(async (email, password) => savedUser(5, email, password))

      const { token } = await AuthService.register(registerBody)

      expect(token.startsWith('Bearer ')).toBe(true)
      const payload = jwt.verify(token.slice(7), SECRET) as jwt.JwtPayload
      expect(payload.sub).toBe(5)
    })

    it('throws 400 when the passwords do not match', async () => {
      await expect(
        AuthService.register({ ...registerBody, confirmPassword: 'other' })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Passwords do not match',
      })
      expect(createUserMock).not.toHaveBeenCalled()
    })

    it('throws 400 and does not call the repository for an invalid email', async () => {
      await expect(
        AuthService.register({ ...registerBody, email: 'not-an-email' })
      ).rejects.toMatchObject({
        statusCode: 400,
      })
      expect(findUserByEmailMock).not.toHaveBeenCalled()
    })

    it('throws 409 when a user with this email already exists', async () => {
      findUserByEmailMock.mockResolvedValue(savedUser(1, 'bob@test.com', sha256('qwe123')))

      await expect(AuthService.register(registerBody)).rejects.toMatchObject({ statusCode: 409 })
      expect(createUserMock).not.toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('returns a token for a correct email and password', async () => {
      findUserByEmailMock.mockResolvedValue(savedUser(2, 'bob@test.com', sha256('qwe123')))

      const { token } = await AuthService.login({ email: 'bob@test.com', password: 'qwe123' })

      const payload = jwt.verify(token.slice(7), SECRET) as jwt.JwtPayload
      expect(payload.sub).toBe(2)
      expect(findUserByEmailMock).toHaveBeenCalledWith('bob@test.com')
    })

    it('throws 401 for a wrong password', async () => {
      findUserByEmailMock.mockResolvedValue(savedUser(2, 'bob@test.com', sha256('qwe123')))

      await expect(
        AuthService.login({ email: 'bob@test.com', password: 'wrong' })
      ).rejects.toMatchObject({
        statusCode: 401,
      })
    })

    it('throws 401 when the user does not exist', async () => {
      findUserByEmailMock.mockResolvedValue(null)

      await expect(
        AuthService.login({ email: 'nobody@test.com', password: 'qwe123' })
      ).rejects.toMatchObject({
        statusCode: 401,
      })
    })

    it('throws 400 when the password is missing', async () => {
      await expect(AuthService.login({ email: 'bob@test.com' } as never)).rejects.toMatchObject({
        statusCode: 400,
      })
      expect(findUserByEmailMock).not.toHaveBeenCalled()
    })
  })
})
