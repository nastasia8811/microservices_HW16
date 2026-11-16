import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from '../entities/User.js'
import { Newspost } from '../entities/Newspost.js'
import { Init1794603224231 } from '../migrations/1794603224231-Init.js'
import { AddDeletedRenameTitle1794603881170 } from '../migrations/1794603881170-AddDeletedRenameTitle.js'
import { AddIndexes1794603997276 } from '../migrations/1794603997276-AddIndexes.js'

export const AppDataSource = new DataSource({
  type: 'postgres',
  // на Vercel база (Neon) дає один рядок підключення DATABASE_URL — якщо він є, TypeORM бере його,
  // локально його немає, і використовуються DB_HOST, DB_PORT і т.д. з .env
  url: process.env.DATABASE_URL as string,
  host: process.env.DB_HOST as string,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_NAME as string,

  synchronize: false,
  // нові міграції застосовуються автоматично при старті сервера (і на Vercel теж)
  migrationsRun: true,

  entities: [User, Newspost],
  // міграції імпортуємо явно: Vercel не бачить файли, підключені через шлях-маску
  migrations: [Init1794603224231, AddDeletedRenameTitle1794603881170, AddIndexes1794603997276],
})
