interface NewspostSchema {
  id: number
  title: string
  text: string
  createDate: Date
  genre: string
  isPrivate: boolean
}

interface UserSchema {
  id: number
  email: string
  password: string
  createDate: Date
}

interface RedisUserSchema {
  id: number
  name: string
  email: string
  createDate: string
}

export type { NewspostSchema, UserSchema, RedisUserSchema }
