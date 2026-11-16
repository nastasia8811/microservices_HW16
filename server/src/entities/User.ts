import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', unique: true })
  email!: string

  // select: false
  @Column({ type: 'varchar', select: false })
  password!: string

  @CreateDateColumn()
  createDate!: Date

  @Column({ type: 'boolean', default: false })
  deleted!: boolean
}
