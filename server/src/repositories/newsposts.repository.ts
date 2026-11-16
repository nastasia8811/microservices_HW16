import { AppDataSource } from '../db/data-source.js'
import { Newspost } from '../entities/Newspost.js'
import type { UserSchema } from '../interfaces/interfaces.js'
import type { CreateNewspostBody, PaginationParams, UpdateNewspostBody } from '../types/types.js'

const table = AppDataSource.getRepository(Newspost)

export class NewspostsRepository {
  static getAll({ page, size }: PaginationParams) {
    return table.find({
      relations: { author: true },
      order: { id: 'ASC' },
      skip: page * size,
      take: size,
    })
  }

  static getById(id: number) {
    return table.findOne({ where: { id }, relations: { author: true } })
  }

  static create(data: CreateNewspostBody, author: UserSchema) {
    return table.save(table.create({ ...data, author }))
  }

  static async update(id: number, data: UpdateNewspostBody) {
    const result = await table.update(id, data)
    if (!result.affected) return null
    return this.getById(id)
  }

  static async delete(id: number) {
    const result = await table.delete(id)
    return result.affected ? id : null
  }
}
