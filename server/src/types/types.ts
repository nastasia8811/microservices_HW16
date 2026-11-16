import type { Request } from 'express'
import type { NewspostSchema } from '../interfaces/interfaces.js'

type NewspostByIdRequest = Request<{ id: string }>

type CreateNewspostBody = Omit<NewspostSchema, 'id' | 'createDate'>
type CreateNewspostRequest = Request<object, object, CreateNewspostBody>

type UpdateNewspostBody = Partial<Omit<NewspostSchema, 'id' | 'createDate'>>
type UpdateNewspostRequest = Request<{ id: string }, object, UpdateNewspostBody>

type DeleteNewspostRequest = Request<{ id: string }>

type PaginationParams = {
  page: number
  size: number
}
type PaginationQuery = {
  page?: string
  size?: string
}

type GetNewspostsRequest = Request<object, object, object, PaginationQuery>

type RegisterBody = {
  email: string
  password: string
  confirmPassword: string
}

type AuthenBody = {
  email: string
  password: string
}

export type {
  NewspostByIdRequest,
  CreateNewspostBody,
  CreateNewspostRequest,
  UpdateNewspostBody,
  UpdateNewspostRequest,
  DeleteNewspostRequest,
  PaginationParams,
  GetNewspostsRequest,
  RegisterBody,
  AuthenBody,
}
