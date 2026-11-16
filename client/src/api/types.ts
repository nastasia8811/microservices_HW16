export interface NewsPost {
  id: number
  title: string
  text: string
  createDate?: string
  genre: string
  isPrivate: boolean
  author?: { id: number; email: string }
}

export interface NewsInput {
  title: string
  text: string
}
