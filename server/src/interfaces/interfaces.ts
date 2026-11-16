// Repository Pattern - Доступ до даних інкапсульований у стандартному наборі операцій.
// Логіка зберігання відокремлена від решти коду, тому спосіб зберігання в майбутньому можна змінити без змін в інших модулях.

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

export type { NewspostSchema, UserSchema }
