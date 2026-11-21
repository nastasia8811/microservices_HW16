import { AppDataSource } from '../db/data-source.js'

export async function connectTestDb() {
  const dbName = new URL(process.env.DATABASE_URL ?? 'postgres://localhost/').pathname
  if (!dbName.endsWith('_test')) {
    throw new Error('API tests run only against a test database: DATABASE_URL must end with _test')
  }
  await AppDataSource.initialize()
}

export async function clearDb() {
  const tables = AppDataSource.entityMetadatas.map(m => `"${m.tableName}"`).join(', ')
  await AppDataSource.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`)
}

export async function closeTestDb() {
  await clearDb()
  await AppDataSource.destroy()
}
