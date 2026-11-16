import { AppDataSource } from '../db/data-source.js'
import { User } from '../entities/User.js'

const users = AppDataSource.getRepository(User)

const findUserByEmail = (email: string) =>
  users.findOne({
    where: { email },
    select: { id: true, email: true, password: true, createDate: true },
  })

const findUserById = (id: number) => users.findOneBy({ id })

const createUser = (email: string, password: string) =>
  users.save(users.create({ email, password }))

export { findUserByEmail, findUserById, createUser }
