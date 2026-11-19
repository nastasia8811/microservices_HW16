import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import type { NewspostsRepository } from '../repositories/newsposts.repository.js'
import type { Newspost } from '../entities/Newspost.js'
import type { UserSchema } from '../interfaces/interfaces.js'
import type { CreateNewspostBody } from '../types/types.js'

const repo = {
  getAll: jest.fn<typeof NewspostsRepository.getAll>(),
  getById: jest.fn<typeof NewspostsRepository.getById>(),
  create: jest.fn<typeof NewspostsRepository.create>(),
  update: jest.fn<typeof NewspostsRepository.update>(),
  delete: jest.fn<typeof NewspostsRepository.delete>(),
}

jest.unstable_mockModule('../repositories/newsposts.repository.js', () => ({
  NewspostsRepository: repo,
}))

const { NewspostsService } = await import('./newsposts.service.js')
const { NewspostsServiceError, ValidationError } = await import('../error/errorHandler.js')

const author: UserSchema = {
  id: 1,
  email: 'bob@test.com',
  password: 'hash',
  createDate: new Date(),
}

const newPost: CreateNewspostBody = {
  title: 'Title',
  text: 'Some text',
  genre: 'Sport',
  isPrivate: false,
}

const savedPost = { id: 1, ...newPost, createDate: new Date(), deleted: false, author } as Newspost

describe('NewspostsService', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('getAll', () => {
    it('returns posts from the repository with the given pagination', async () => {
      repo.getAll.mockResolvedValue([savedPost])

      const result = await NewspostsService.getAll({ page: 2, size: 5 })

      expect(repo.getAll).toHaveBeenCalledWith({ page: 2, size: 5 })
      expect(result).toEqual([savedPost])
    })

    it('throws NewspostsServiceError when the repository fails', async () => {
      repo.getAll.mockRejectedValue(new Error('db down'))

      await expect(NewspostsService.getAll({ page: 0, size: 10 })).rejects.toThrow(
        NewspostsServiceError
      )
    })
  })

  describe('getById', () => {
    it('returns the post when it exists', async () => {
      repo.getById.mockResolvedValue(savedPost)

      const result = await NewspostsService.getById(1)

      expect(repo.getById).toHaveBeenCalledWith(1)
      expect(result).toEqual(savedPost)
    })

    it('returns null for a non-existent id', async () => {
      repo.getById.mockResolvedValue(null)

      await expect(NewspostsService.getById(99)).resolves.toBeNull()
    })

    it('throws 500 with the error message when the repository fails', async () => {
      repo.getById.mockRejectedValue(new Error('db down'))

      await expect(NewspostsService.getById(1)).rejects.toMatchObject({
        statusCode: 500,
        message: 'getById failed: db down',
      })
    })
  })

  describe('create', () => {
    it('saves the post with its author when the data is valid', async () => {
      repo.create.mockImplementation(
        async (data, user) => ({ id: 7, ...data, author: user }) as Newspost
      )

      const result = await NewspostsService.create(newPost, author)

      expect(repo.create).toHaveBeenCalledWith(newPost, author)
      expect(result).toMatchObject({ id: 7, title: 'Title', author })
    })

    it('throws 400 and does not call the repository for an unknown genre', async () => {
      await expect(
        NewspostsService.create({ ...newPost, genre: 'Unknown' }, author)
      ).rejects.toMatchObject({
        statusCode: 400,
      })
      expect(repo.create).not.toHaveBeenCalled()
    })

    it('throws 400 when the title is longer than 50 characters', async () => {
      await expect(
        NewspostsService.create({ ...newPost, title: 'a'.repeat(51) }, author)
      ).rejects.toThrow(ValidationError)
      expect(repo.create).not.toHaveBeenCalled()
    })

    it('throws NewspostsServiceError when the repository fails', async () => {
      repo.create.mockRejectedValue(new Error('db down'))

      await expect(NewspostsService.create(newPost, author)).rejects.toThrow(NewspostsServiceError)
    })
  })

  describe('update', () => {
    it('updates the post when the data is valid', async () => {
      const updatedPost = { ...savedPost, title: 'New title' } as Newspost
      repo.update.mockResolvedValue(updatedPost)

      const result = await NewspostsService.update(1, { title: 'New title' })

      expect(repo.update).toHaveBeenCalledWith(1, { title: 'New title' })
      expect(result).toEqual(updatedPost)
    })

    it('returns null for a non-existent id', async () => {
      repo.update.mockResolvedValue(null)

      await expect(NewspostsService.update(99, { title: 'New title' })).resolves.toBeNull()
    })

    it('throws 400 and does not call the repository for an empty body', async () => {
      await expect(NewspostsService.update(1, {})).rejects.toMatchObject({ statusCode: 400 })
      expect(repo.update).not.toHaveBeenCalled()
    })

    it('throws NewspostsServiceError when the repository fails', async () => {
      repo.update.mockRejectedValue(new Error('db down'))

      await expect(NewspostsService.update(1, { title: 'New title' })).rejects.toThrow(
        NewspostsServiceError
      )
    })
  })

  describe('delete', () => {
    it('returns the id of the deleted post', async () => {
      repo.delete.mockResolvedValue(3)

      await expect(NewspostsService.delete(3)).resolves.toBe(3)
      expect(repo.delete).toHaveBeenCalledWith(3)
    })

    it('returns null when nothing was deleted', async () => {
      repo.delete.mockResolvedValue(null)

      await expect(NewspostsService.delete(99)).resolves.toBeNull()
    })

    it('throws NewspostsServiceError when the repository fails', async () => {
      repo.delete.mockRejectedValue(new Error('db down'))

      await expect(NewspostsService.delete(1)).rejects.toThrow(NewspostsServiceError)
    })
  })

  describe('throwError', () => {
    it('throws NewspostsServiceError', () => {
      expect(() => NewspostsService.throwError()).toThrow(NewspostsServiceError)
    })
  })
})
