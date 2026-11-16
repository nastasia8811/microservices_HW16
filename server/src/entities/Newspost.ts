import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm'
import { User } from './User.js'

@Entity('newsposts')
export class Newspost {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 50, name: 'header' })
  title!: string

  @Column({ type: 'varchar', length: 256 })
  text!: string

  @Column({ type: 'varchar' })
  genre!: string

  @Column({ type: 'boolean', default: false })
  isPrivate!: boolean

  @CreateDateColumn()
  createDate!: Date

  @Column({ type: 'boolean', default: false })
  deleted!: boolean

  @Index()
  @ManyToOne(() => User, { nullable: false })
  author!: User
}
