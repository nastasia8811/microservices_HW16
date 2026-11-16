import { NewspostsRepository } from '../repositories/newsposts.repository.js'
import type { CreateNewspostBody, UpdateNewspostBody, PaginationParams } from '../types/types.js'
import { ValidationError, NewspostsServiceError } from '../error/errorHandler.js'
import { ajv, validateCreate, validateUpdate } from '../validation/validation.js'
import type { UserSchema } from '../interfaces/interfaces.js'

export class NewspostsService {
  static async getAll(params: PaginationParams) {
    try {
      return await NewspostsRepository.getAll(params)
    } catch (error) {
      throw new NewspostsServiceError(`getAll failed: ${(error as Error).message}`)
    }
  }

  static async getById(id: number) {
    try {
      return await NewspostsRepository.getById(id)
    } catch (error) {
      throw new NewspostsServiceError(`getById failed: ${(error as Error).message}`)
    }
  }

  static async create(data: CreateNewspostBody, author: UserSchema) {
    if (!validateCreate(data)) {
      throw new ValidationError(ajv.errorsText(validateCreate.errors))
    }
    try {
      return await NewspostsRepository.create(data, author)
    } catch (error) {
      throw new NewspostsServiceError(`create failed: ${(error as Error).message}`)
    }
  }

  static async update(id: number, update: UpdateNewspostBody) {
    if (!validateUpdate(update)) {
      throw new ValidationError(ajv.errorsText(validateUpdate.errors))
    }
    try {
      return await NewspostsRepository.update(id, update)
    } catch (error) {
      throw new NewspostsServiceError(`update failed: ${(error as Error).message}`)
    }
  }

  static async delete(id: number) {
    try {
      return await NewspostsRepository.delete(id)
    } catch (error) {
      throw new NewspostsServiceError(`delete failed: ${(error as Error).message}`)
    }
  }

  static throwError() {
    throw new NewspostsServiceError('Demo NewspostsServiceError')
  }
}
