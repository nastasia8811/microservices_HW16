import { findUserByEmail, createUser } from '../repositories/users.repository.js'
import { hashPassword, createToken } from '../auth.js'
import { ErrorHandler, ValidationError } from '../error/errorHandler.js'
import { ajv, validateRegistration, validateAuthentification } from '../validation/validation.js'
import type { RegisterBody, AuthenBody } from '../types/types.js'

const validateRegister = ajv.compile<RegisterBody>(validateRegistration)
const validateLogin = ajv.compile<AuthenBody>(validateAuthentification)

export class AuthService {
  static async register(data: RegisterBody) {
    if (!validateRegister(data)) {
      throw new ValidationError(ajv.errorsText(validateRegister.errors))
    }
    if (data.password !== data.confirmPassword) {
      throw new ValidationError('Passwords do not match')
    }
    if (await findUserByEmail(data.email)) {
      throw new ErrorHandler('User already exists', 409)
    }

    const user = await createUser(data.email, hashPassword(data.password))
    return { token: createToken(user) }
  }

  static async login(data: AuthenBody) {
    if (!validateLogin(data)) {
      throw new ValidationError(ajv.errorsText(validateLogin.errors))
    }

    const user = await findUserByEmail(data.email)
    if (!user || user.password !== hashPassword(data.password)) {
      throw new ErrorHandler('Invalid email or password', 401)
    }
    return { token: createToken(user) }
  }
}
